<?php
/**
 * Brillo Events Management Services — High-Reliability Namecheap Private Email Mail Relay
 * Paths: public/api/mailer.php & api/mailer.php
 * 
 * Provides:
 * 1. Direct authenticated SMTP to mail.privateemail.com:465 (SSL)
 *    Eliminates cPanel "Relaying not permitted" errors.
 * 2. Secure server-side config storage (mail_config.json) protected by .htaccess
 * 3. Automatic domain typo fix (@gmial.com -> @gmail.com)
 * 4. Fallback to cPanel local Exim MTA
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$configFile = __DIR__ . '/mail_config.json';
$savedConfig = [];
if (file_exists($configFile)) {
    $rawCfg = @file_get_contents($configFile);
    if ($rawCfg) {
        $savedConfig = json_decode($rawCfg, true) ?: [];
    }
}

// Health check GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'success' => true,
        'status' => 'operational',
        'transporter' => 'Namecheap Private Email (mail.privateemail.com:465)',
        'sender' => $savedConfig['sender'] ?? 'bookings@brilloevent.com',
        'isConfigured' => !empty($savedConfig['password']),
        'serverTime' => date('c'),
    ]);
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

$action = $data['action'] ?? 'SEND';

// Action: Save & Cache SMTP Credentials permanently on cPanel
if ($action === 'SAVE_CONFIG') {
    $newPass = trim($data['password'] ?? '');
    if (!empty($newPass)) {
        $savedConfig['password'] = $newPass;
        $savedConfig['sender'] = $data['sender'] ?? 'bookings@brilloevent.com';
        $savedConfig['replyTo'] = $data['replyTo'] ?? 'info@brilloevent.com';
        $savedConfig['host'] = $data['host'] ?? 'mail.privateemail.com';
        $savedConfig['port'] = intval($data['port'] ?? 465);
        $savedConfig['updatedAt'] = date('c');

        @file_put_contents($configFile, json_encode($savedConfig, JSON_PRETTY_PRINT));
        @chmod($configFile, 0600);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Private Email credentials saved securely on server.',
        'isConfigured' => !empty($savedConfig['password']),
    ]);
    exit();
}

// Clean and validate recipient address
$rawTo = trim($data['to'] ?? $data['testRecipient'] ?? '');
// Auto-correct common domain typos
$rawTo = preg_replace('/@gmial\.com$/i', '@gmail.com', $rawTo);
$rawTo = preg_replace('/@gmai\.com$/i', '@gmail.com', $rawTo);
$rawTo = preg_replace('/@hotmial\.com$/i', '@hotmail.com', $rawTo);
$rawTo = preg_replace('/@yaho\.com$/i', '@yahoo.com', $rawTo);

$to = filter_var($rawTo, FILTER_VALIDATE_EMAIL);
$subject = trim($data['subject'] ?? '');
$html = $data['html'] ?? '';

// Default values
$fromEmail = $savedConfig['sender'] ?? 'bookings@brilloevent.com';
$fromName = $data['fromName'] ?? 'Brillo Events Management Services';
$replyTo = !empty($data['replyTo']) ? trim($data['replyTo']) : ($savedConfig['replyTo'] ?? 'info@brilloevent.com');
$smtpPass = !empty($data['password']) ? trim($data['password']) : ($savedConfig['password'] ?? '');
$smtpHost = $savedConfig['host'] ?? 'mail.privateemail.com';
$smtpPort = intval($savedConfig['port'] ?? 465);

// If action is TEST_CONNECTION, construct default test HTML if missing
if ($action === 'TEST_CONNECTION') {
    if (empty($to)) {
        $to = 'bookings@brilloevent.com';
    }
    if (empty($subject)) {
        $subject = 'Brillo Events — Namecheap Private Email Transporter Verified! 🎄';
    }
    if (empty($html)) {
        $html = "
        <div style=\"font-family: Arial, sans-serif; padding: 24px; border: 2px solid #D6B36A; border-radius: 12px; background: #FAF7F5; max-width: 600px; margin: 0 auto;\">
          <div style=\"background: #780D22; padding: 18px; border-radius: 8px; text-align: center; color: #FFF8F0; margin-bottom: 20px;\">
            <h2 style=\"margin: 0; font-size: 20px; letter-spacing: 1px;\">BRILLO EVENTS</h2>
            <div style=\"font-size: 11px; color: #D6B36A; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;\">Private Email Transporter Active</div>
          </div>
          <p style=\"font-size: 14px; color: #211619;\">Hello Brillo Operations,</p>
          <p style=\"font-size: 14px; color: #211619;\">Your <strong>Namecheap Private Email Transporter</strong> is authenticated and delivering messages cleanly without cPanel relay blocks.</p>
          <div style=\"background: #FFF; padding: 16px; border: 1px solid #E8DFE0; border-radius: 8px; font-size: 12px; line-height: 1.6; color: #5C494E;\">
            <strong>Host:</strong> {$smtpHost}:{$smtpPort} (SSL Encrypted)<br>
            <strong>Sender:</strong> {$fromEmail}<br>
            <strong>Delivery Target:</strong> {$to}<br>
            <strong>Authenticated Timestamp:</strong> " . date('r') . "
          </div>
          <p style=\"font-size: 13px; color: #780D22; font-weight: bold; margin-top: 20px;\">
            All transactional sequences (Inquiry acknowledgment, quotations, receipts, and reset links) will now route directly through Namecheap Private Email.
          </p>
        </div>";
    }
}

if (!$to) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid recipient email address.']);
    exit();
}

if (empty($subject) || empty($html)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Subject and HTML body content are required.']);
    exit();
}

/**
 * Socket SMTP Implementation for mail.privateemail.com:465
 */
function sendSmtpSsl($host, $port, $user, $pass, $to, $fromEmail, $fromName, $replyTo, $subject, $html) {
    $timeout = 15;
    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ]);
    
    $socket = @stream_socket_client("ssl://{$host}:{$port}", $errno, $errstr, $timeout, STREAM_CLIENT_CONNECT, $context);
    if (!$socket) {
        return ['success' => false, 'error' => "Failed to connect to {$host}:{$port}: {$errstr} ({$errno})"];
    }

    $read = function() use ($socket) {
        $res = '';
        while ($str = fgets($socket, 515)) {
            $res .= $str;
            if (substr($str, 3, 1) === ' ') break;
        }
        return $res;
    };

    $send = function($cmd) use ($socket) {
        fputs($socket, $cmd . "\r\n");
    };

    $init = $read();
    if (substr($init, 0, 3) !== '220') {
        fclose($socket);
        return ['success' => false, 'error' => "SMTP greeting error: {$init}"];
    }

    $send("EHLO " . ($_SERVER['SERVER_NAME'] ?? 'brilloevent.com'));
    $ehlo = $read();

    $send("AUTH LOGIN");
    $auth = $read();
    if (substr($auth, 0, 3) !== '334') {
        fclose($socket);
        return ['success' => false, 'error' => "AUTH LOGIN rejected: {$auth}"];
    }

    $send(base64_encode($user));
    $userRes = $read();
    if (substr($userRes, 0, 3) !== '334') {
        fclose($socket);
        return ['success' => false, 'error' => "Username rejected: {$userRes}"];
    }

    $send(base64_encode($pass));
    $passRes = $read();
    if (substr($passRes, 0, 3) !== '235') {
        fclose($socket);
        return ['success' => false, 'error' => "Authentication failed. Please verify your Private Email password."];
    }

    $send("MAIL FROM:<{$fromEmail}>");
    $mailRes = $read();
    if (substr($mailRes, 0, 3) !== '250') {
        fclose($socket);
        return ['success' => false, 'error' => "MAIL FROM rejected: {$mailRes}"];
    }

    $send("RCPT TO:<{$to}>");
    $rcptRes = $read();
    if (substr($rcptRes, 0, 3) !== '250' && substr($rcptRes, 0, 3) !== '251') {
        fclose($socket);
        return ['success' => false, 'error' => "RCPT TO rejected for {$to}: {$rcptRes}"];
    }

    $send("DATA");
    $dataRes = $read();
    if (substr($dataRes, 0, 3) !== '354') {
        fclose($socket);
        return ['success' => false, 'error' => "DATA rejected: {$dataRes}"];
    }

    $headers = [];
    $headers[] = "MIME-Version: 1.0";
    $headers[] = "From: =?UTF-8?B?" . base64_encode($fromName) . "?= <{$fromEmail}>";
    $headers[] = "To: <{$to}>";
    $headers[] = "Reply-To: <{$replyTo}>";
    $headers[] = "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=";
    $headers[] = "Date: " . date('r');
    $headers[] = "Content-Type: text/html; charset=UTF-8";
    $headers[] = "Content-Transfer-Encoding: base64";

    $rawMessage = implode("\r\n", $headers) . "\r\n\r\n" . chunk_split(base64_encode($html)) . "\r\n.";
    $send($rawMessage);
    $sendRes = $read();

    $send("QUIT");
    fclose($socket);

    if (substr($sendRes, 0, 3) === '250') {
        return ['success' => true];
    }
    return ['success' => false, 'error' => "Message dispatch error: {$sendRes}"];
}

$dispatched = false;
$dispatchMethod = '';
$dispatchError = '';

// 1. Try Authenticated SMTP with Private Email password
if (!empty($smtpPass)) {
    $res = sendSmtpSsl($smtpHost, $smtpPort, $fromEmail, $smtpPass, $to, $fromEmail, $fromName, $replyTo, $subject, $html);
    if ($res['success']) {
        $dispatched = true;
        $dispatchMethod = 'PrivateEmail_SMTP_SSL_465';

        // Auto-save password if it worked and not yet persisted
        if (empty($savedConfig['password']) || $savedConfig['password'] !== $smtpPass) {
            $savedConfig['password'] = $smtpPass;
            $savedConfig['sender'] = $fromEmail;
            $savedConfig['replyTo'] = $replyTo;
            $savedConfig['host'] = $smtpHost;
            $savedConfig['port'] = $smtpPort;
            @file_put_contents($configFile, json_encode($savedConfig, JSON_PRETTY_PRINT));
            @chmod($configFile, 0600);
        }
    } else {
        $dispatchError = $res['error'];
    }
}

// 2. Fallback to cPanel local MTA if no password or SMTP failed
if (!$dispatched && empty($dispatchError)) {
    $headers = [];
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-type: text/html; charset=UTF-8';
    $headers[] = "From: {$fromName} <{$fromEmail}>";
    $headers[] = "Reply-To: {$replyTo}";
    $headers[] = "X-Mailer: BrilloEvents/3.0";
    $headerString = implode("\r\n", $headers);

    $sent = @mail($to, $subject, $html, $headerString, "-f{$fromEmail}");
    if ($sent) {
        $dispatched = true;
        $dispatchMethod = 'cPanel_MTA';
    } else {
        $dispatchError = "cPanel local MTA rejected message. Authenticated SMTP is required.";
    }
}

if ($dispatched) {
    echo json_encode([
        'success' => true,
        'message' => "Email successfully delivered to {$to} via {$dispatchMethod}!",
        'recipient' => $to,
        'method' => $dispatchMethod,
        'timestamp' => date('c'),
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => "Delivery failed to {$to}: " . ($dispatchError ?: "Namecheap Private Email requires SMTP authentication over Port 465."),
    ]);
}
