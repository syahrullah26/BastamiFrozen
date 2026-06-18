import Image from "next/image";

export default function QrCodeSimple() {
  return (
    <div className="p-6 text-center">
      <h3 className="text-lg font-semibold mb-4">Scan QR Code</h3>
      <Image
        width={200}
        height={200}
        src="http://localhost:8000/api/test/generate-qr"
        alt="Voucher QR Code"
        className="w-64 h-64 mx-auto border"
      />
    </div>
  );
}
