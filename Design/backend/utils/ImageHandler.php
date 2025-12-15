<?php
// backend/utils/ImageHandler.php

class ImageHandler {
    public static function saveBase64Image($base64String, $targetDir) {
        if (empty($base64String)) return null;

        // Очистка строки
        if (preg_match('/^data:image\/(\w+);base64,/', $base64String, $type)) {
            $data = substr($base64String, strpos($base64String, ',') + 1);
            $data = base64_decode($data);
        } else {
            return null;
        }

        if ($data === false) return null;

        $image = imagecreatefromstring($data);
        if (!$image) return null;

        // Ресайз до 800px (требование задания)
        $origWidth = imagesx($image);
        $origHeight = imagesy($image);
        $newWidth = 800;

        if ($origWidth > $newWidth) {
            $newHeight = floor($origHeight * ($newWidth / $origWidth));
            $newImage = imagecreatetruecolor($newWidth, $newHeight);
            
            // Белый фон
            $white = imagecolorallocate($newImage, 255, 255, 255);
            imagefilledrectangle($newImage, 0, 0, $newWidth, $newHeight, $white);
            
            imagecopyresampled($newImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);
            imagedestroy($image);
            $image = $newImage;
        }

        // Сохранение
        $fileName = uniqid('user_', true) . '.jpg';
        $targetPath = $targetDir . '/' . $fileName;

        imagejpeg($image, $targetPath, 90);
        imagedestroy($image);

        return $fileName;
    }
}