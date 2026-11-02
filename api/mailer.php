<?php
/**
 * Brillo Events Management Services — Namecheap cPanel Mail Relay Script
 * Path: public_html/api/mailer.php
 * 
 * Allows static frontends or external webhooks to securely dispatch transactional
 * emails through Namecheap hosting using Private Email credentials.
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed. Use POST.']);
    exit();
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON payload.']);
    exit();
}

$to = filter_var($data['to'] ?? '', FILTER_VALIDATE_EMAIL);
$subject = trim($data['subject'] ?? '');
$html = $data['html'] ?? '';
$fromEmail = 'bookings@brilloevent.com';
$fromName = 'Brillo Events Management Services';
$replyTo = $data['replyTo'] ?? 'info@brilloevent.com';

if (!$to || empty($subject) || empty($html)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields: to, subject, or html.']);
    exit();
}

// Headers for MIME HTML email
$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-type: text/html; charset=UTF-8';
$headers[] = "From: {$fromName} <{$fromEmail}>";
$headers[] = "Reply-To: {$replyTo}";
$headers[] = "X-Mailer: PHP/" . phpversion();

$headerString = implode("\r\n", $headers);

// Send via PHP mail() which routes through Namecheap cPanel Exim/Postfix MTA
$sent = mail($to, $subject, $html, $headerString, "-f{$fromEmail}");

if ($sent) {
    echo json_encode([
        'success' => true,
        'message' => "Email successfully dispatched to {$to}.",
        'timestamp' => date('c'),
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to dispatch email through server MTA. Please check cPanel Mail Delivery Logs.',
    ]);
}
