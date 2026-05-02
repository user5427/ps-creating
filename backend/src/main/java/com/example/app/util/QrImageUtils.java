package com.example.app.util;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import java.io.ByteArrayOutputStream;
import java.util.EnumMap;
import java.util.Map;
import javax.imageio.ImageIO;
import org.springframework.stereotype.Component;

@Component
public class QrImageUtils {

    public byte[] createPng(String payload, int sizePx) {
        try {
            Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
            hints.put(EncodeHintType.MARGIN, 1);
            BitMatrix matrix = new MultiFormatWriter()
                    .encode(payload, BarcodeFormat.QR_CODE, sizePx, sizePx, hints);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ImageIO.write(MatrixToImageWriter.toBufferedImage(matrix), "PNG", out);
            return out.toByteArray();
        } catch (WriterException | java.io.IOException ex) {
            throw new IllegalStateException("Unable to generate QR image", ex);
        }
    }
}
