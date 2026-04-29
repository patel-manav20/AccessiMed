from app.services.accessibility import contrast_ratio, deterministic_fix


def test_contrast_ratio_detects_low_contrast():
    ratio = contrast_ratio("#999999", "#ffffff")
    assert ratio is not None
    assert ratio < 4.5


def test_deterministic_fix_for_missing_alt():
    fixed_html, explanation, confidence = deterministic_fix("image-alt", '<img src="/hero.png">')
    assert 'alt="Descriptive image text"' in fixed_html
    assert "screen readers" in explanation
    assert confidence >= 0.8
