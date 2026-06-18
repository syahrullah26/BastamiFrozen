<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class QrcodeController extends Controller
{
    public function generateVoucherQrCode(Request $request)
    {
        $targetUrl = 'https://dewaunited.com/';
        $qrCodeImage = QrCode::format('svg')
            ->size(300)
            ->margin(1)
            ->errorCorrection('H')
            ->generate($targetUrl);
        $base64Qr = 'data:image/svg+xml;base64,' . base64_encode($qrCodeImage);
        return response($qrCodeImage)->header('Content-Type', 'image/svg+xml');
    }
}
