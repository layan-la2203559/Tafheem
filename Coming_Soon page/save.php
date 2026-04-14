
<?php
function loadEnv($path) {
    if (!file_exists($path)) return;

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;

        list($name, $value) = explode('=', $line, 2);
        $_ENV[$name] = $value;
    }
}

loadEnv(__DIR__ . '/.env');

header("Content-Type: application/json");

// Hostinger credentials (DB)
$host = "localhost";
$user = $_ENV['DB_USER'];
$pass = $_ENV['DB_PASS'];
$db   = $_ENV['DB_NAME'];

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo json_encode(["message" => "Database connection failed"]);
    exit();
}

// get JSON input
$data = json_decode(file_get_contents("php://input"), true);
//Read language from request
$lang = $data["lang"] ?? "en";
/* anti-spam delay */
sleep(1);
$name = htmlspecialchars(trim($data["name"]));
$email = trim($data["email"]);

$name  = $conn->real_escape_string($data["name"]);
$email = $conn->real_escape_string($data["email"]);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["message" => "Invalid email"]);
    exit();
}

// insert or update if exists (save to DB)
$stmt = $conn->prepare("
INSERT INTO waiting_list (email, name)
VALUES (?, ?)
ON DUPLICATE KEY UPDATE name=VALUES(name)
");

$stmt->bind_param("ss", $email, $name);

if (!$stmt->execute()) {
    echo json_encode(["message" => "Database save failed"]);
    exit();
}

/* ======================
    SUBSCRIBE VIA KIT API
====================== */

$firstName = explode(" ", $name)[0];
$apiSecret = $_ENV['KIT_API_SECRET'];
$tag = ($lang === "ar") ? "language_arabic" : "language_english";

// Step 1: Find or create the tag
$tagsRes = file_get_contents("https://api.convertkit.com/v3/tags?api_secret=" . urlencode($apiSecret));
$tagsData = json_decode($tagsRes, true);
$tagId = null;

if (isset($tagsData['tags'])) {
    foreach ($tagsData['tags'] as $t) {
        if ($t['name'] === $tag) {
            $tagId = $t['id'];
            break;
        }
    }
}

// If tag doesn't exist, create it
if (!$tagId) {
    $createTagOpts = [
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/json',
            'content' => json_encode([
                'api_secret' => $apiSecret,
                'tag' => ['name' => $tag]
            ])
        ]
    ];
    $createTagRes = file_get_contents("https://api.convertkit.com/v3/tags", false, stream_context_create($createTagOpts));
    $createTagData = json_decode($createTagRes, true);
    if (isset($createTagData['id'])) {
        $tagId = $createTagData['id'];
    }
}

// Step 2: Subscribe the user to the tag (this adds them as a subscriber AND tags them)
if ($tagId) {
    $subscribeOpts = [
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/json',
            'content' => json_encode([
                'api_secret' => $apiSecret,
                'email' => $email,
                'first_name' => $firstName
            ])
        ]
    ];
    $subscribeRes = file_get_contents(
        "https://api.convertkit.com/v3/tags/" . $tagId . "/subscribe",
        false,
        stream_context_create($subscribeOpts)
    );
    $subscribeData = json_decode($subscribeRes, true);

    if (!isset($subscribeData['subscription'])) {
        echo json_encode(["message" => "Subscription failed. Please try again."]);
        exit();
    }
}

if ($lang === "ar") {
    $responseMsg = "تم تسجيلك في قائمة الانتظار! تحقق من بريدك الإلكتروني 📩";
} else {
    $responseMsg = "You're on the waitlist! Check your email 📩";
}

echo json_encode(["message" => $responseMsg]);
$conn->close();
?>
