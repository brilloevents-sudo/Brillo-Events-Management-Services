<?php
/**
 * Brillo Events Management Services - Official xendit-php Gateway Integration
 * Repository: https://github.com/xendit/xendit-php.git
 *
 * Supports automatic Philippine payment collection & settlement for:
 * - GCash (PH_GCASH)
 * - Bank of the Philippine Islands / BPI (PH_BPI / DD_BPI)
 * - BDO Unibank (PH_BDO)
 * - UnionBank of the Philippines (PH_UBP / DD_UBP)
 * - Maya Wallet (PH_PAYMAYA)
 * - Metrobank, RCBC, Chinabank, LandBank via QR Ph (QRPH)
 */

require_once __DIR__ . '/vendor/autoload.php';

use Xendit\Configuration;
use Xendit\Invoice\InvoiceApi;
use Xendit\Invoice\CreateInvoiceRequest;
use Xendit\Payout\PayoutApi;
use Xendit\Payout\CreatePayoutRequest;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Callback-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$xenditSecretKey = getenv('XENDIT_SECRET_KEY') ?: 'xnd_development_brillo_events_santa_hub_key';
Configuration::setXenditKey($xenditSecretKey);

$rawInput = file_get_contents('php://input');
$payload = json_decode($rawInput, true) ?? [];

$action = $_GET['action'] ?? ($payload['action'] ?? 'create_invoice');

try {
    if ($action === 'create_invoice') {
        $apiInstance = new InvoiceApi();

        $bookingNumber = $payload['bookingNumber'] ?? ('B2026-' . rand(1000, 9999));
        $amount = (float)($payload['amount'] ?? 9000);
        $payerEmail = $payload['email'] ?? 'client@smsupermalls.com';
        $mallOrVenue = $payload['mallOrVenue'] ?? 'Corporate Venue';
        $contactPerson = $payload['contactPerson'] ?? 'Authorized Representative';
        $phone = $payload['phone'] ?? '+639278872343';

        $createInvoiceRequest = new CreateInvoiceRequest([
            'external_id' => 'BRILLO-' . $bookingNumber . '-' . time(),
            'amount' => $amount,
            'payer_email' => $payerEmail,
            'description' => "Brillo Events Real-Beard Santa Reservation - {$mallOrVenue} ({$bookingNumber})",
            'invoice_duration' => 86400,
            'currency' => 'PHP',
            'payment_methods' => [
                'GCASH',
                'DD_BPI',
                'DD_UBP',
                'PAYMAYA',
                'QRPH',
                'CREDIT_CARD'
            ],
            'success_redirect_url' => 'https://brilloevent.com/?xendit_status=paid&booking=' . urlencode($bookingNumber),
            'failure_redirect_url' => 'https://brilloevent.com/?xendit_status=failed&booking=' . urlencode($bookingNumber)
        ]);

        $result = $apiInstance->createInvoice($createInvoiceRequest);

        echo json_encode([
            'success' => true,
            'sdk' => 'xendit/xendit-php v7',
            'invoice_id' => $result['id'],
            'external_id' => $result['external_id'],
            'invoice_url' => $result['invoice_url'],
            'amount' => $result['amount'],
            'status' => $result['status']
        ]);
        exit;
    }

    if ($action === 'disburse_to_bank') {
        // Automatic payout/settlement to Owner's GCash (PH_GCASH), BPI (PH_BPI), or BDO (PH_BDO)
        $payoutApi = new PayoutApi();
        $idempotencyKey = 'payout-' . uniqid();
        $channelCode = $payload['channel_code'] ?? 'PH_BPI'; // PH_GCASH, PH_BPI, PH_BDO, PH_UBP, PH_MBTC

        $payoutRequest = new CreatePayoutRequest([
            'reference_id' => 'BRILLO-SETTLEMENT-' . time(),
            'channel_code' => $channelCode,
            'channel_properties' => [
                'account_holder_name' => $payload['account_holder_name'] ?? 'Brillo Events Management Services',
                'account_number' => $payload['account_number'] ?? '0041892374'
            ],
            'amount' => (float)($payload['amount'] ?? 9000),
            'description' => 'Brillo Events Santa Booking Auto-Settlement',
            'currency' => 'PHP'
        ]);

        $payout = $payoutApi->createPayout($idempotencyKey, null, $payoutRequest);
        echo json_encode([
            'success' => true,
            'sdk' => 'xendit/xendit-php v7',
            'payout' => $payout
        ]);
        exit;
    }
} catch (\Xendit\XenditSdkException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'sdk' => 'xendit/xendit-php v7',
        'error' => $e->getMessage(),
        'full_error' => $e->getFullError()
    ]);
}
