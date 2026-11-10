<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$rootDir = dirname(__DIR__);
$dataDir = $rootDir . '/data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}
$overrideFile = $dataDir . '/talents_override.json';
$snapshotFile = $rootDir . '/static-db-snapshot.json';

// Helper to load base talents from snapshot if override doesn't exist
function loadInitialTalents($snapshotFile) {
    if (file_exists($snapshotFile)) {
        $json = @file_get_contents($snapshotFile);
        $data = @json_decode($json, true);
        if (isset($data['talents']['talents']) && is_array($data['talents']['talents'])) {
            return $data['talents']['talents'];
        }
    }
    return [];
}

// Load current talents
$talents = [];
if (file_exists($overrideFile)) {
    $raw = @file_get_contents($overrideFile);
    $parsed = @json_decode($raw, true);
    if (is_array($parsed)) {
        $talents = $parsed;
    }
}

if (empty($talents)) {
    $talents = loadInitialTalents($snapshotFile);
    if (!empty($talents)) {
        @file_put_contents($overrideFile, json_encode($talents, JSON_PRETTY_PRINT), LOCK_EX);
    }
}

// Helper to extract talent ID from URL / Query / Server Request
$talentId = isset($_GET['id']) ? trim($_GET['id']) : '';
if (empty($talentId) && !empty($_SERVER['REQUEST_URI'])) {
    $uriPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if (preg_match('#/api/talents/([a-zA-Z0-9_.-]+)#', $uriPath, $m)) {
        $talentId = trim($m[1]);
    }
}
if (empty($talentId) && isset($_SERVER['PATH_INFO'])) {
    $parts = explode('/', trim($_SERVER['PATH_INFO'], '/'));
    if (!empty($parts[0])) {
        $talentId = $parts[0];
    }
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Single Talent fetch
    if (!empty($talentId)) {
        foreach ($talents as $t) {
            if ((isset($t['id']) && strcasecmp($t['id'], $talentId) === 0) ||
                (isset($t['canonicalId']) && strcasecmp($t['canonicalId'], $talentId) === 0)) {
                echo json_encode(['success' => true, 'talent' => $t]);
                exit;
            }
        }
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Talent not found']);
        exit;
    }

    // List Talents fetch
    $publicOnly = isset($_GET['publicOnly']) && ($_GET['publicOnly'] === 'true' || $_GET['publicOnly'] === '1');
    $result = [];
    foreach ($talents as $t) {
        if ($publicOnly) {
            if (!empty($t['approvedForPublicDisplay'])) {
                $result[] = $t;
            }
        } else {
            $result[] = $t;
        }
    }

    echo json_encode([
        'success' => true,
        'count' => count($result),
        'talents' => $result
    ]);
    exit;
}

if ($method === 'POST' || $method === 'PATCH') {
    $rawInput = @file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?: [];
    if (empty($input) && !empty($_POST)) {
        $input = $_POST;
    }

    if (empty($talentId)) {
        if (!empty($input['id'])) $talentId = trim($input['id']);
        elseif (!empty($input['talentId'])) $talentId = trim($input['talentId']);
        elseif (!empty($_POST['id'])) $talentId = trim($_POST['id']);
        elseif (!empty($_POST['talentId'])) $talentId = trim($_POST['talentId']);
    }

    $isCreateNew = ($method === 'POST' && empty($talentId) && empty($input['action']) && empty($_POST['action']));

    if ($isCreateNew) {
        $newId = 'tal_custom_' . round(microtime(true) * 1000);
        $displayName = !empty($input['displayName']) ? $input['displayName'] : 'New Santa';
        $canonicalId = 'TAL-' . substr(preg_replace('/[^A-Z0-9]/', '', strtoupper($displayName)), 0, 8);

        $images = [];
        if (!empty($input['fileDataUrl']) || !empty($input['publicUrl'])) {
            $images[] = [
                'id' => 'img_' . round(microtime(true) * 1000),
                'talentId' => $newId,
                'fileName' => !empty($input['fileName']) ? $input['fileName'] : 'portrait.jpg',
                'publicUrl' => !empty($input['fileDataUrl']) ? $input['fileDataUrl'] : $input['publicUrl'],
                'isPrimary' => true,
                'caption' => $displayName . ' Portrait',
                'approvedForClient' => true
            ];
        }

        $newTalent = [
            'id' => $newId,
            'canonicalId' => $canonicalId,
            'sourceName' => !empty($input['sourceName']) ? $input['sourceName'] : $displayName,
            'displayName' => $displayName,
            'talentType' => !empty($input['talentType']) ? $input['talentType'] : 'REAL_BEARD',
            'status' => 'ACTIVE',
            'age' => !empty($input['age']) ? intval($input['age']) : 60,
            'height' => !empty($input['height']) ? $input['height'] : "6'0\"",
            'nationality' => !empty($input['nationality']) ? $input['nationality'] : 'International',
            'phone' => !empty($input['phone']) ? $input['phone'] : '',
            'baseTalentFee' => !empty($input['baseTalentFee']) ? floatval($input['baseTalentFee']) : 12000,
            'metroManilaRate' => !empty($input['metroManilaRate']) ? floatval($input['metroManilaRate']) : 18000,
            'provincialRate' => !empty($input['provincialRate']) ? floatval($input['provincialRate']) : 23400,
            'holidayRate' => !empty($input['holidayRate']) ? floatval($input['holidayRate']) : 21000,
            'specialRateNote' => !empty($input['specialRateNote']) ? $input['specialRateNote'] : '',
            'bio' => !empty($input['bio']) ? $input['bio'] : '',
            'approvedForPublicDisplay' => isset($input['approvedForPublicDisplay']) ? boolval($input['approvedForPublicDisplay']) : true,
            'images' => $images,
            'aliases' => [],
            'assignments' => [],
            'ledgerEntries' => []
        ];

        array_unshift($talents, $newTalent);
        @file_put_contents($overrideFile, json_encode($talents, JSON_PRETTY_PRINT), LOCK_EX);

        echo json_encode(['success' => true, 'talent' => $newTalent]);
        exit;
    }

    $targetIndex = -1;
    foreach ($talents as $idx => $t) {
        if ((isset($t['id']) && strcasecmp($t['id'], $talentId) === 0) ||
            (isset($t['canonicalId']) && strcasecmp($t['canonicalId'], $talentId) === 0)) {
            $targetIndex = $idx;
            break;
        }
    }

    if ($targetIndex === -1) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Talent not found to update']);
        exit;
    }

    $current = $talents[$targetIndex];
    $action = isset($input['action']) ? $input['action'] : (isset($_POST['action']) ? $_POST['action'] : '');

    if ($action === 'ADD_PHOTO' || $action === 'ADD_MEDIA') {
        $uploadsDir = $rootDir . '/talents/uploads';
        if (!is_dir($uploadsDir)) {
            @mkdir($uploadsDir, 0755, true);
        }

        $url = '';
        $fileName = !empty($input['fileName']) ? $input['fileName'] : (!empty($_POST['fileName']) ? $_POST['fileName'] : '');
        $isVideo = false;

        // 1. Direct file upload from multipart FormData (Restricted to safe image/video extensions)
        $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm', 'mov', 'm4v'];
        if (!empty($_FILES['file']['tmp_name']) && is_uploaded_file($_FILES['file']['tmp_name'])) {
            $orig = basename($_FILES['file']['name']);
            $ext = strtolower(pathinfo($orig, PATHINFO_EXTENSION) ?: 'jpg');
            if (!in_array($ext, $allowedExts, true)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid file extension. Only JPG, PNG, WebP, MP4, WebM, and MOV are allowed.']);
                exit;
            }
            $safeBase = preg_replace('/[^a-zA-Z0-9_-]/', '_', pathinfo($orig, PATHINFO_FILENAME));
            $uniqueFile = time() . '_' . $safeBase . '.' . $ext;
            $dest = $uploadsDir . '/' . $uniqueFile;
            if (@move_uploaded_file($_FILES['file']['tmp_name'], $dest)) {
                $url = '/talents/uploads/' . $uniqueFile;
                $fileName = $fileName ?: $orig;
            }
            $mime = !empty($_FILES['file']['type']) ? $_FILES['file']['type'] : '';
            if (in_array($ext, ['mp4', 'webm', 'mov', 'm4v']) || strpos($mime, 'video/') === 0) {
                $isVideo = true;
            }
        }
        // 2. Base64 fileDataUrl -> write to physical file on disk
        elseif (!empty($input['fileDataUrl']) && preg_match('#^data:(image|video)/([a-zA-Z0-9+.-]+);base64,(.+)$#s', $input['fileDataUrl'], $b64Matches)) {
            $mediaKind = $b64Matches[1];
            $ext = strtolower($b64Matches[2]);
            if ($ext === 'jpeg') $ext = 'jpg';
            if ($ext === 'quicktime') $ext = 'mov';
            if (!in_array($ext, $allowedExts, true)) {
                $ext = ($mediaKind === 'video') ? 'mp4' : 'jpg';
            }
            if ($mediaKind === 'video' || in_array($ext, ['mp4', 'webm', 'mov', 'm4v'])) {
                $isVideo = true;
            }
            $bin = base64_decode($b64Matches[3]);
            if ($bin !== false) {
                $safeBase = preg_replace('/[^a-zA-Z0-9_-]/', '_', pathinfo($fileName ?: "santa_{$current['displayName']}", PATHINFO_FILENAME));
                $uniqueFile = time() . '_' . $safeBase . '.' . $ext;
                $dest = $uploadsDir . '/' . $uniqueFile;
                if (@file_put_contents($dest, $bin) !== false) {
                    $url = '/talents/uploads/' . $uniqueFile;
                }
            }
        }
        // 3. Cloud / External link (YouTube, Vimeo, Google Drive, direct MP4)
        elseif (!empty($input['publicUrl']) || !empty($_POST['publicUrl'])) {
            $url = trim(!empty($input['publicUrl']) ? $input['publicUrl'] : $_POST['publicUrl']);
        }

        if (empty($url) && !empty($input['fileDataUrl'])) {
            $url = $input['fileDataUrl'];
        }

        if (!$isVideo) {
            $isVideo = preg_match('/\.(mp4|webm|mov|m4v)(\?|$)/i', $url) ||
                       preg_match('/\.(mp4|webm|mov|m4v)$/i', $fileName) ||
                       strpos($url, 'data:video/') === 0 ||
                       preg_match('/youtube\.com|youtu\.be|vimeo\.com|drive\.google\.com/i', $url);
        }

        $setPrimary = (!empty($input['setAsPrimary']) || !empty($_POST['setAsPrimary'])) && !$isVideo;
        if ($setPrimary && !empty($current['images'])) {
            foreach ($current['images'] as &$img) {
                $img['isPrimary'] = false;
            }
        }

        $caption = !empty($input['caption']) ? $input['caption'] : (!empty($_POST['caption']) ? $_POST['caption'] : ('Santa ' . $current['displayName'] . ' ' . ($isVideo ? 'Video Clip' : 'Portrait')));
        $approvedForClient = isset($input['approvedForClient']) ? boolval($input['approvedForClient']) : (isset($_POST['approvedForClient']) ? boolval($_POST['approvedForClient']) : true);

        $newMedia = [
            'id' => 'img_' . round(microtime(true) * 1000),
            'talentId' => $current['id'],
            'fileName' => !empty($fileName) ? $fileName : ($isVideo ? 'santa_video.mp4' : 'santa_portrait.jpg'),
            'publicUrl' => $url,
            'originalPath' => $url,
            'isPrimary' => $setPrimary,
            'mediaType' => $isVideo ? 'VIDEO' : 'IMAGE',
            'caption' => $caption,
            'approvedForClient' => $approvedForClient
        ];

        if (!isset($current['images']) || !is_array($current['images'])) {
            $current['images'] = [];
        }

        if ($setPrimary) {
            array_unshift($current['images'], $newMedia);
        } else {
            $current['images'][] = $newMedia;
        }
    }
    } elseif ($action === 'SET_PRIMARY_PHOTO' && !empty($input['imageId'])) {
        $targetImgId = $input['imageId'];
        if (!empty($current['images']) && is_array($current['images'])) {
            foreach ($current['images'] as &$img) {
                $img['isPrimary'] = (isset($img['id']) && $img['id'] === $targetImgId);
            }
        }
    } elseif ($action === 'DELETE_PHOTO' && !empty($input['imageId'])) {
        $targetImgId = $input['imageId'];
        if (!empty($current['images']) && is_array($current['images'])) {
            $wasPrimary = false;
            foreach ($current['images'] as $img) {
                if (((isset($img['id']) && $img['id'] === $targetImgId) ||
                     (isset($img['publicUrl']) && $img['publicUrl'] === $targetImgId)) &&
                    !empty($img['isPrimary'])) {
                    $wasPrimary = true;
                    break;
                }
            }
            $current['images'] = array_values(array_filter($current['images'], function($img) use ($targetImgId) {
                $matchId = isset($img['id']) && $img['id'] === $targetImgId;
                $matchUrl = isset($img['publicUrl']) && $img['publicUrl'] === $targetImgId;
                return !($matchId || $matchUrl);
            }));
            if ($wasPrimary && !empty($current['images'])) {
                $current['images'][0]['isPrimary'] = true;
            }
        }
    } elseif ($action === 'REORDER_PHOTOS' && !empty($input['images']) && is_array($input['images'])) {
        $current['images'] = $input['images'];
    } else {
        // Direct field updates
        $fields = [
            'displayName', 'sourceName', 'talentType', 'status', 'age', 'height',
            'nationality', 'phone', 'bio', 'baseTalentFee', 'metroManilaRate',
            'provincialRate', 'holidayRate', 'specialRateNote', 'approvedForPublicDisplay'
        ];
        foreach ($fields as $f) {
            if (isset($input[$f])) {
                if ($f === 'approvedForPublicDisplay') {
                    $current[$f] = boolval($input[$f]);
                } elseif (in_array($f, ['baseTalentFee', 'metroManilaRate', 'provincialRate', 'holidayRate'])) {
                    $current[$f] = floatval($input[$f]);
                } elseif ($f === 'age') {
                    $current[$f] = !empty($input[$f]) ? intval($input[$f]) : null;
                } else {
                    $current[$f] = $input[$f];
                }
            }
        }

        // If incoming images array provided
        if (isset($input['images']) && is_array($input['images'])) {
            $current['images'] = $input['images'];
        }
    }

    $talents[$targetIndex] = $current;
    @file_put_contents($overrideFile, json_encode($talents, JSON_PRETTY_PRINT), LOCK_EX);

    echo json_encode(['success' => true, 'talent' => $current]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
