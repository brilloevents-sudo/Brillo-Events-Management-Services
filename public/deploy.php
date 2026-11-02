<?php
/**
 * Brillo Events — Automated GitHub to cPanel Webhook Deployment Script
 * 
 * Target Repository: /home/brilzloz/repositories/Brepositories/brilloeventrillo-Events-Management-Services
 * Live Directory: /home/brilzloz/brilloevent.com/
 */

header('Content-Type: application/json');

// Secret token for security
define('DEPLOY_SECRET', 'brillo_deploy_token_2026');

$tokenParam = $_GET['token'] ?? '';
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

$isAuthenticated = false;

// 1. Check direct query token: ?token=brillo_deploy_token_2026
if ($tokenParam && hash_equals(DEPLOY_SECRET, $tokenParam)) {
    $isAuthenticated = true;
}

// 2. Check GitHub Webhook HMAC SHA256 Signature
if (!$isAuthenticated && $signature) {
    $rawPayload = file_get_contents('php://input');
    if (strpos($signature, 'sha256=') === 0) {
        $receivedHash = substr($signature, 7);
        $expectedHash = hash_hmac('sha256', $rawPayload, DEPLOY_SECRET);
        if (hash_equals($expectedHash, $receivedHash)) {
            $isAuthenticated = true;
        }
    }
}

if (!$isAuthenticated) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'error' => 'Forbidden: Invalid or missing deployment secret token.',
        'tip' => 'Provide ?token=YOUR_TOKEN or GitHub HMAC SHA-256 secret.'
    ]);
    exit;
}

// Target paths on Namecheap cPanel
$repoPath = '/home/brilzloz/repositories/Brepositories/brilloeventrillo-Events-Management-Services';
$livePath = '/home/brilzloz/brilloevent.com';

$logs = [];

// Step A: Git Fetch & Reset in Repository
if (is_dir($repoPath)) {
    $cmdA = "cd {$repoPath} && git fetch origin main && git reset --hard origin/main 2>&1";
    exec($cmdA, $outputA, $statusA);
    $logs['git_pull'] = [
        'status' => $statusA,
        'output' => $outputA
    ];

    // Step B: Run cPanel UAPI VersionControlDeployment if available
    $uapiCmd = "/usr/local/cpanel/bin/uapi VersionControlDeployment create repository_root={$repoPath} 2>&1";
    exec($uapiCmd, $outputUapi, $statusUapi);
    $logs['uapi_deploy'] = [
        'status' => $statusUapi,
        'output' => $outputUapi
    ];

    // Step C: Copy updated files to live directory
    if (is_dir($livePath)) {
        $syncCmd = "cp -R {$repoPath}/* {$livePath}/ 2>&1 && cp {$repoPath}/.htaccess {$livePath}/.htaccess 2>&1";
        exec($syncCmd, $outputSync, $statusSync);
        $logs['sync_live'] = [
            'status' => $statusSync,
            'output' => $outputSync
        ];
    }
} else {
    // Direct sync if running within live path
    exec("git pull origin main 2>&1", $outputDirect, $statusDirect);
    $logs['direct_git'] = [
        'status' => $statusDirect,
        'output' => $outputDirect
    ];
}

echo json_encode([
    'success' => true,
    'message' => 'Automated deployment completed successfully!',
    'deployed_at' => date('Y-m-d H:i:s T'),
    'logs' => $logs
]);
