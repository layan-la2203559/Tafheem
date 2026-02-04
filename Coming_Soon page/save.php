<?php
header("Content-Type: application/json");

// Hostinger credentials
$host = "localhost";
$user = "u392551836_waiting_user";
$pass = "dQ!0KZq1";
$db   = "u392551836_waitinglist_db";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo json_encode(["message" => "Database connection failed"]);
    exit();
}

// get JSON input
$data = json_decode(file_get_contents("php://input"), true);

$name  = trim($data["name"]);
$email = trim($data["email"]);

$name  = $conn->real_escape_string($data["name"]);
$email = $conn->real_escape_string($data["email"]);

// insert or update if exists
$sql = "
INSERT INTO waiting_list (email, name)
VALUES ('$email', '$name')
ON DUPLICATE KEY UPDATE name='$name'
";

if ($conn->query($sql)) {

    /* ======================
       SEND EMAIL
    ====================== */

    $firstName = explode(" ", $name)[0];

    $to = $email;
    $subject = "Welcome to the Tafheem Waitlist, $firstName";

    $message = "
Assalamu alaikum wa rahmatullahi wa barakatuh, $firstName.

Thank you for reserving your spot on the Tafheem waitlist. We are truly grateful to have you with us.

Tafheem is being carefully crafted as a dedicated space for thoughtful Qur’an reflection — a place to slow down, deepen your connection, and engage with the meanings of the Qur’an.

As a founding waitlist member, you’ll receive:
• Exclusive early access when we launch.
• Personal updates on new reflections and features.
• A direct voice in shaping Tafheem’s growth.

We are building Tafheem with sincere intention and care, and we are honored to have you accompanying us from the very beginning.

We will be in touch soon, in shā’ Allāh.

Jazakallahu khairan,
The Tafheem Team
";

    $headers = "From: Tafheem <hello@tafheem.io>\r\n";
    $headers .= "Reply-To: hello@tafheem.io\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    mail($to, $subject, $message, $headers);

    echo json_encode(["message" => "You're on the waitlist! Check your email "]);

} else {
    echo json_encode(["message" => "Something went wrong"]);
}

$conn->close();
?>
