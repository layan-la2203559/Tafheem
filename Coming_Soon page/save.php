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

$name  = $conn->real_escape_string($data["name"]);
$email = $conn->real_escape_string($data["email"]);

// insert or update if exists
$sql = "
INSERT INTO waiting_list (email, name)
VALUES ('$email', '$name')
ON DUPLICATE KEY UPDATE name='$name'
";

if ($conn->query($sql)) {
    echo json_encode(["message" => "You're on the waitlist!"]);
} else {
    echo json_encode(["message" => "Something went wrong"]);
}

$conn->close();
?>
