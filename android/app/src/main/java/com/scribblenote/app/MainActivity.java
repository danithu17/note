package com.scribblenote.app;

import android.graphics.Rect;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 1. Enable true Android edge-to-edge system insets
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        // 2. Hardware acceleration and disable overscroll glow in native WebView
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().setLayerType(View.LAYER_TYPE_HARDWARE, null);
            getBridge().getWebView().setOverScrollMode(View.OVER_SCROLL_NEVER);
        }

        // 3. System gesture exclusion zones along screen edges for drawing
        setupGestureExclusion();
    }

    private void setupGestureExclusion() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            final View decorView = getWindow().getDecorView();
            decorView.post(() -> {
                int height = decorView.getHeight();
                int width = decorView.getWidth();
                int edgeWidth = (int) (24 * getResources().getDisplayMetrics().density);

                List<Rect> exclusionRects = new ArrayList<>();
                // Exclude active drawing region edges from accidental system back swipe
                exclusionRects.add(new Rect(0, height / 5, edgeWidth, (height * 4) / 5));
                exclusionRects.add(new Rect(width - edgeWidth, height / 5, width, (height * 4) / 5));

                decorView.setSystemGestureExclusionRects(exclusionRects);
            });
        }
    }
}
