<?php

class EncryptionHelper {

    // Encrypt plaintext and return a base64 string
    public static function encrypt(string $plaintext, string $key): string {

        $key = base64_decode($key); // decode if stored as base64
        $iv = random_bytes(12); // GCM recommends 12 bytes IV
        $tag = ''; // tag will be filled by openssl_encrypt

        $ciphertext = openssl_encrypt(
            $plaintext,
            'aes-256-gcm',
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );

        if ($ciphertext === false) {
            throw new Exception('Encryption failed');
        }

        // Return IV + tag + ciphertext, all base64 encoded
        return base64_encode($iv . $tag . $ciphertext);
    }



    // Decrypt the base64 string back to plaintext
    public static function decrypt(string $encryptedBase64, string $key): string {

        $key = base64_decode($key);
        $data = base64_decode($encryptedBase64);

        if (strlen($data) < 28) { // IV (12) + Tag (16)
            throw new Exception('Invalid data for decryption');
        }

        $iv = substr($data, 0, 12);
        $tag = substr($data, 12, 16);
        $ciphertext = substr($data, 28);

        $plaintext = openssl_decrypt(
            $ciphertext,
            'aes-256-gcm',
            $key,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );

        if ($plaintext === false) {
            throw new Exception('Decryption failed');
        }

        return $plaintext;
    }
}
