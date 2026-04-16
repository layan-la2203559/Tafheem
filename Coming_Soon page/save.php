
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

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
require 'PHPMailer/src/Exception.php';

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

$firstName = explode(" ", $name)[0];

/* ======================
    SEND COPY TO KIT API
    (just stores info, no email from Kit)
====================== */

$apiSecret = $_ENV['KIT_API_SECRET'] ?? '';
if ($apiSecret) {
    $tag = ($lang === "ar") ? "language_arabic" : "language_english";

    // Find or create the tag
    $tagsRes = @file_get_contents("https://api.convertkit.com/v3/tags?api_secret=" . urlencode($apiSecret));
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
        $createTagRes = @file_get_contents("https://api.convertkit.com/v3/tags", false, stream_context_create($createTagOpts));
        $createTagData = json_decode($createTagRes, true);
        if (isset($createTagData['id'])) {
            $tagId = $createTagData['id'];
        }
    }

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
        @file_get_contents(
            "https://api.convertkit.com/v3/tags/" . $tagId . "/subscribe",
            false,
            stream_context_create($subscribeOpts)
        );
    }
    // Kit failure is silent — the user still gets their welcome email below
}

/* ======================
    SEND EMAIL (SMTP)
====================== */

// Brand Colors
$purple   = "#70334c";
$yellow   = "#dbbc47";
$beige    = "#faf5e5";
$offwhite = "#fefcf7";
$gray     = "#c8d1d5";

if ($lang === "ar") {
    $subject = "مرحباً بك في قائمة انتظار تفهيم، $firstName";
    $dir = "rtl";
    $fontFamily = "'Amiri', serif";
    $titleHtml = "<span style='color: $yellow;'>تفهيم</span>";
     $content = "
        <p>السلام عليكم ورحمة الله وبركاته $firstName،</p>
        <p>شكرًا لحجز مكانك في قائمة انتظار <strong>تفهيم</strong>. نحن ممتنون جدًا لانضمامك إلينا.</p>
        <p>تفهيم يتم تطويرها بعناية لتكون مساحة هادئة للتدبر في القرآن الكريم، تساعدك على التأني، وتعميق صلتك بكتاب الله، والتفاعل مع معانيه العظيمة.</p>

        <div style='background-color: $beige; padding: 20px; border-right: 4px solid $yellow; margin: 25px 0;'>
            <h3 style='margin-top:0; color: $purple; font-family: $fontFamily;'>بصفتك عضواً في قائمة الانتظار، ستحصل على:</h3>
            <ul style='padding-right: 20px; margin-bottom: 0;'>
                <li>وصول مبكر حصري عند الإطلاق.</li>
                <li>تحديثات خاصة بالميزات الجديدة والتأملات.</li>
                <li>فرصة للمساهمة برأيك في تطوير المنصة.</li>
            </ul>
        </div>

        <p>سنكون على تواصل قريبًا بإذن الله.</p>
        <p>جزاك الله خيرًا،<br><strong>فريق تفهيم</strong></p>
    ";
} else {
    $subject = "Welcome to the Tafheem Waitlist, $firstName";
    $dir = "ltr";
    $fontFamily = "'Playfair Display', 'Georgia', serif";

    $titleHtml = "<span style='color: $yellow;'>Tafheem</span>";
    $content = "
        <p>Assalamu alaikum wa rahmatullahi wa barakatuh, $firstName.</p>
        <p>Thank you for reserving your spot on the <strong>Tafheem</strong> waitlist. We are truly grateful to have you with us.</p>
        <p>Tafheem is being carefully crafted as a dedicated space for thoughtful Qur'an reflection — a place to slow down, deepen your connection, and engage with the meanings of the Qur'an.</p>

        <div style='background-color: $beige; padding: 20px; border-left: 4px solid $yellow; margin: 25px 0;'>
            <h3 style='margin-top:0; color: $purple; font-family: $fontFamily;'>As a founding waitlist member, you'll receive:</h3>
            <ul style='padding-left: 20px; margin-bottom: 0;'>
                <li>Exclusive early access when we launch.</li>
                <li>Personal updates on new reflections and features.</li>
                <li>A direct voice in shaping Tafheem's growth.</li>
            </ul>
        </div>

        <p>We will be in touch soon, in shā' Allāh.</p>
        <p>Jazakallahu khairan,<br><strong>The Tafheem Team</strong></p>
    ";
}

// The HTML Template
$htmlBody = "
<div dir='$dir' style='background-color: $offwhite; padding: 40px 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: $purple; line-height: 1.8;'>
    <table align='center' border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px; background-color: #ffffff; border: 1px solid $gray; border-radius: 16px; overflow: hidden;'>
        <tr>
            <td align='center' style='padding: 35px; background-color: $purple;'>
                <h1 style='margin: 0; font-family: $fontFamily; font-size: 32px; letter-spacing: 1px;'>$titleHtml</h1>
                <div style='color: $gray; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; margin-top: 5px;'>Qur'an Reflection</div>
            </td>
        </tr>
        <tr>
            <td style='padding: 40px 35px; font-size: 16px;'>
                $content
            </td>
        </tr>
        <tr>
            <td align='center' style='padding: 25px; background-color: $offwhite; color: rgba(112, 51, 76, 0.5); font-size: 12px; border-top: 1px solid $beige;'>
                © " . date("Y") . " Tafheem.io <br>
                Sent with care to seekers of reflection.
            </td>
        </tr>
    </table>
</div>
";

$mail = new PHPMailer(true);
$mail->CharSet = 'UTF-8';
$mail->Encoding = 'base64';
try {
    $mail->isSMTP();
    $mail->Host       = $_ENV['SMTP_HOST'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $_ENV['SMTP_USER'];
    $mail->Password   = $_ENV['SMTP_PASS'];
    $mail->SMTPSecure = 'tls';
    $mail->Port       = $_ENV['SMTP_PORT'];

    $mail->setFrom('hello@tafheem.io', 'Tafheem');
    $mail->addAddress($email, $firstName);
$mail->isHTML(true);
$mail->Subject = $subject;
$mail->Body    = $htmlBody;
$mail->AltBody = strip_tags($message); // Plain text version for old clients

$mail->send();
}catch (Exception $e) {
    echo json_encode(["message" => "Mailer Error: " . $mail->ErrorInfo]);
    exit();
}
if ($lang === "ar") {
    $responseMsg = "تم تسجيلك في قائمة الانتظار! تحقق من بريدك الإلكتروني 📩";
} else {
    $responseMsg = "You're on the waitlist! Check your email 📩";
}

echo json_encode(["message" => $responseMsg]);
$conn->close();
?>
