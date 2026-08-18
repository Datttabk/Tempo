import os
import json
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

class VideoRenderEngine:
    def __init__(self, base_dir="/Users/dattakambagi/Desktop/Tempo"):
        self.base_dir = base_dir
        self.fonts_dir = os.path.join(base_dir, "assets/fonts")

    def load_template_config(self, template_id_or_slug):
        # Search for template config by template_id or slug
        templates_dir = os.path.join(self.base_dir, "assets/templates")
        for folder in os.listdir(templates_dir):
            cfg_file = os.path.join(templates_dir, folder, "config.json")
            if os.path.exists(cfg_file):
                with open(cfg_file, "r") as f:
                    cfg = json.load(f)
                    if cfg.get("template_id") == template_id_or_slug or cfg.get("slug") == template_id_or_slug:
                        return cfg
        raise ValueError(f"Template '{template_id_or_slug}' not found.")

    def validate_inputs(self, config, customer_data):
        errors = {}
        for field in config.get("fields", []):
            field_id = field["id"]
            label = field.get("label", field_id)
            if field.get("static_value") is not None:
                continue
            
            value = str(customer_data.get(field_id, "")).strip()
            
            if field.get("required") and not value:
                errors[field_id] = f"'{label}' is required."
                continue
                
            if value:
                max_chars = field.get("max_chars")
                if max_chars and len(value) > max_chars:
                    errors[field_id] = f"'{label}' exceeds maximum character limit of {max_chars} characters. Please shorten this information to fit the video template."
                    
                max_words = field.get("max_words")
                if max_words and len(value.split()) > max_words:
                    errors[field_id] = f"'{label}' exceeds maximum word count of {max_words} words. Please shorten this information to fit the video template."

        if errors:
            return False, errors
        return True, None

    def _get_font(self, font_name, size):
        font_path = os.path.join(self.fonts_dir, font_name)
        if not os.path.exists(font_path):
            # Fallback to system fonts
            if "Bold" in font_name:
                font_path = os.path.join(self.fonts_dir, "Georgia-Bold.ttf")
            else:
                font_path = os.path.join(self.fonts_dir, "Georgia.ttf")
        return ImageFont.truetype(font_path, size)

    def _hex_to_rgba(self, hex_color, alpha=255):
        hex_color = hex_color.lstrip("#")
        if len(hex_color) == 6:
            r, g, b = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
            return (r, g, b, alpha)
        elif len(hex_color) == 8:
            r, g, b, a = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4, 6))
            return (r, g, b, int(a * (alpha / 255.0)))
        return (255, 255, 255, alpha)

    def fit_text_font(self, text, font_name, initial_size, max_width, draw_ctx):
        size = initial_size
        while size > 16:
            font = self._get_font(font_name, size)
            bbox = draw_ctx.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            if text_width <= max_width:
                return font
            size -= 2
        return self._get_font(font_name, 16)

    def render_order_video(self, template_id, customer_data, output_filepath):
        config = self.load_template_config(template_id)
        
        # 1. Validate inputs strictly
        valid, errors = self.validate_inputs(config, customer_data)
        if not valid:
            raise ValueError(f"Input validation failed: {errors}")

        master_rel_path = config["master_video"]
        master_full_path = os.path.join(self.base_dir, master_rel_path)
        if not os.path.exists(master_full_path):
            raise FileNotFoundError(f"Master video not found at {master_full_path}")

        cap = cv2.VideoCapture(master_full_path)
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        temp_avi = output_filepath + ".temp.avi"
        fourcc = cv2.VideoWriter_fourcc(*'MJPG')
        out = cv2.VideoWriter(temp_avi, fourcc, fps, (width, height))

        # Dummy draw context for text fitting
        dummy_img = Image.new("RGBA", (width, height))
        dummy_draw = ImageDraw.Draw(dummy_img)

        # Pre-process text fields & fonts
        field_render_info = []
        for field in config.get("fields", []):
            field_id = field["id"]
            if field.get("static_value") is not None:
                text_val = str(field["static_value"])
            else:
                text_val = str(customer_data.get(field_id, "")).strip()

            if not text_val:
                continue

            font_name = field.get("font_family", "Georgia-Bold.ttf")
            initial_size = field.get("font_size", 36)
            max_w = field.get("max_width", width - 80)
            fitted_font = self.fit_text_font(text_val.upper(), font_name, initial_size, max_w, dummy_draw)

            field_render_info.append({
                "text": text_val.upper(),
                "start_time": field.get("start_time", 0.0),
                "end_time": field.get("end_time", 999.0),
                "x": field.get("x", width // 2),
                "y": field.get("y", height // 2),
                "font": fitted_font,
                "color_hex": field.get("color", "#FFFFFF"),
                "align": field.get("align", "center"),
                "animation": field.get("animation", "fade_in"),
                "anim_duration": field.get("anim_duration", 0.5)
            })

        frame_idx = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            t = frame_idx / fps

            # Convert BGR (cv2) -> RGBA (PIL)
            img_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)).convert("RGBA")
            txt_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
            draw = ImageDraw.Draw(txt_layer)

            for info in field_render_info:
                st = info["start_time"]
                et = info["end_time"]
                if st <= t <= et:
                    # Calculate animation progress (0.0 to 1.0)
                    anim_type = info["animation"]
                    anim_dur = info["anim_duration"]
                    
                    if t - st < anim_dur:
                        progress = max(0.0, min(1.0, (t - st) / anim_dur))
                    else:
                        progress = 1.0

                    # Exit animation calculation
                    if et - t < anim_dur:
                        exit_progress = max(0.0, min(1.0, (et - t) / anim_dur))
                        progress *= exit_progress

                    alpha = int(255 * progress)
                    if alpha <= 0:
                        continue

                    x = info["x"]
                    y = info["y"]
                    
                    # Apply slide animation offset
                    if anim_type == "slide_up" and progress < 1.0:
                        y += int(30 * (1.0 - progress))

                    color = self._hex_to_rgba(info["color_hex"], alpha)
                    shadow = (0, 0, 0, int(180 * (alpha / 255.0)))

                    # Draw drop shadow
                    draw.text((x + 2, y + 2), info["text"], font=info["font"], fill=shadow, anchor="mm")
                    # Draw text
                    draw.text((x, y), info["text"], font=info["font"], fill=color, anchor="mm")

            composite = Image.alpha_composite(img_pil, txt_layer)
            frame_out = cv2.cvtColor(np.array(composite.convert("RGB")), cv2.COLOR_RGB2BGR)
            out.write(frame_out)
            frame_idx += 1

        cap.release()
        out.release()

        # Check 4K output config
        out_cfg = config.get("output", {})
        target_w = out_cfg.get("width", 2160)
        target_h = out_cfg.get("height", 3840)

        os.makedirs(os.path.dirname(output_filepath), exist_ok=True)

        # Scale to target 4K vertical resolution and encode with h264
        cmd = (
            f'ffmpeg -i "{temp_avi}" -i "{master_full_path}" '
            f'-vf "scale={target_w}:{target_h}:flags=bicubic" '
            f'-c:v h264_videotoolbox -b:v 12M -c:a copy -map 0:v:0 -map 1:a:0 '
            f'"{output_filepath}" -y'
        )
        os.system(cmd)

        if os.path.exists(temp_avi):
            os.remove(temp_avi)

        if not os.path.exists(output_filepath) or os.path.getsize(output_filepath) < 100000:
            raise RuntimeError(f"Rendering failed or output video file size too small: {output_filepath}")

        return output_filepath
