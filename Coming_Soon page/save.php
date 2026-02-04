
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
       SEND EMAIL (SMTP)
    ====================== */

    $firstName = explode(" ", $name)[0];

    // $to = $email;
    // $subject = "Welcome to the Tafheem Waitlist, $firstName";

    $message = "
Assalamu alaikum wa rahmatullahi wa barakatuh, $firstName.

Thank you for reserving your spot on the Tafheem waitlist. We are truly grateful to have you with us.

Tafheem is being carefully crafted as a dedicated space for thoughtful Qur'an reflection — a place to slow down, deepen your connection, and engage with the meanings of the Qur'an.

As a founding waitlist member, you'll receive:
• Exclusive early access when we launch.
• Personal updates on new reflections and features.
• A direct voice in shaping Tafheem's growth.

We are building Tafheem with sincere intention and care, and we are honored to have you accompanying us from the very beginning.

We will be in touch soon, in shā' Allāh.

Jazakallahu khairan,
The Tafheem Team
";

$mail = new PHPMailer(true);
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

    $mail->Subject = "Welcome to the Tafheem Waitlist, $firstName";
    $mail->Body    = $message;

    $mail->send();

} catch (Exception $e) {
    // optional: log errors
}
echo json_encode(["message" => "You're on the waitlist! Check your email 📩"]);

$conn->close();
?>
