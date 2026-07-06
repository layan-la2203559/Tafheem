<?php
/**
 * ONE-TIME Kit diagnostic. Upload to Coming_Soon_page/ on the server, then visit:
 *   https://tafheem.io/kit_test.php?debug=tafheem
 * It reveals WHY subscribers aren't reaching Kit. DELETE it when done.
 * (This file is gitignored, so it is never committed.)
 */

if (($_GET['debug'] ?? '') !== 'tafheem') {
    http_response_code(403);
    exit('Forbidden');
}

header('Content-Type: text/plain; charset=utf-8');

// --- load .env exactly like save.php does ---
function loadEnv($path) {
    if (!file_exists($path)) return false;
    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
    return true;
}

echo "== ENV ==\n";
$envLoaded = loadEnv(__DIR__ . '/.env');
echo ".env file found:        " . ($envLoaded ? "YES" : "NO  <-- .env is missing!") . "\n";

$secret = $_ENV['KIT_API_SECRET'] ?? '';
echo "KIT_API_SECRET present:  " . ($secret ? "YES (len " . strlen($secret) . ", starts '" . substr($secret, 0, 4) . "...')" : "NO  <-- not set in .env!") . "\n";

echo "\n== PHP CAPABILITIES ==\n";
echo "allow_url_fopen:         " . (ini_get('allow_url_fopen') ? "ON" : "OFF <-- file_get_contents() to URLs will FAIL") . "\n";
echo "cURL extension:          " . (function_exists('curl_init') ? "available" : "MISSING") . "\n";

if (!$secret) {
    echo "\nSTOP: no API secret loaded, so no Kit call can work. Fix .env first.\n";
    exit;
}

// --- Test 1: list tags via cURL (works even if allow_url_fopen is off) ---
echo "\n== TEST 1: GET /v3/tags (via cURL) ==\n";
$ch = curl_init("https://api.convertkit.com/v3/tags?api_secret=" . urlencode($secret));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 20);
$body = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err  = curl_error($ch);
curl_close($ch);
echo "HTTP status:             " . $code . "\n";
if ($err) echo "cURL error:              " . $err . "\n";
if ($code === 200) {
    $tags = json_decode($body, true)['tags'] ?? [];
    echo "SECRET IS VALID. Tags found (" . count($tags) . "):\n";
    foreach ($tags as $t) echo "   - id " . $t['id'] . "  name '" . $t['name'] . "'\n";
} else {
    echo "SECRET REJECTED or network blocked. Raw response:\n" . substr($body, 0, 400) . "\n";
}

// --- Test 2: also try file_get_contents (what save.php currently uses) ---
echo "\n== TEST 2: same call via file_get_contents (what save.php uses now) ==\n";
$fgc = @file_get_contents("https://api.convertkit.com/v3/tags?api_secret=" . urlencode($secret));
echo ($fgc === false)
    ? "file_get_contents FAILED  <-- this is why save.php silently adds nothing to Kit\n"
    : "file_get_contents worked (so allow_url_fopen is fine)\n";

echo "\nDone. Delete this file after reading.\n";
