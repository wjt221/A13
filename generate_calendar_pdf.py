from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

W, H = letter  # 8.5 x 11 in

NAVY   = colors.HexColor("#0A2218")
TEAL   = colors.HexColor("#2A7A6F")
RUST   = colors.HexColor("#B7603B")
WINE   = colors.HexColor("#8A1E2D")
RULE   = colors.HexColor("#D8D8D0")
INK3   = colors.HexColor("#8A8A82")
WHITE  = colors.white

CAT_COLORS = {
    "Core In-Person Event":          NAVY,
    "Virtual Business Event":        TEAL,
    "Optional Connection Experience": RUST,
}

EVENTS = [
    {"move": "01", "title": "Before the First Serve",                      "sub": "The Journey Begins at the US Open",    "date": "August 27, 2026",      "loc": "New York, NY",    "chair": "Raghav Sapra",               "cat": "Core In-Person Event"},
    {"move": "02", "title": "Cranberries, Chocolate, and Wellness",        "sub": "",                                     "date": "October 3, 2026",      "loc": "Chatsworth, NJ",  "chair": "William Tenenbaum",          "cat": "Optional Connection Experience"},
    {"move": "03", "title": "Inside the FBI",                              "sub": "Leadership Under Pressure",            "date": "October 13, 2026",     "loc": "Washington, DC",  "chair": "Mark Stephenson",            "cat": "Core In-Person Event"},
    {"move": "04", "title": "Generational Wealth",                         "sub": "Designing the System Before It Is Needed", "date": "November 12, 2026","loc": "Virtual",         "chair": "William Tenenbaum",          "cat": "Virtual Business Event"},
    {"move": "05", "title": "Atlantic 13 Holiday Party Meets Broadway",    "sub": "",                                     "date": "December 1, 2026",     "loc": "New York, NY",    "chair": "Jacquelyn Lane",             "cat": "Core In-Person Event"},
    {"move": "06", "title": "Scaling Without Breaking in the Age of AI",   "sub": "",                                     "date": "January 2027",         "loc": "Virtual",         "chair": "MichaelAaron Flicker",       "cat": "Virtual Business Event"},
    {"move": "07", "title": "Caribbean Escape",                            "sub": "St. Barths",                           "date": "January 2027",         "loc": "St. Barths",      "chair": "Brooke Neblett",             "cat": "Optional Connection Experience"},
    {"move": "08", "title": "Pushing the Limits at Harvard Business School","sub": "",                                    "date": "February 2027",        "loc": "Boston, MA",      "chair": "Max Winthrop & Tara Fung",   "cat": "Core In-Person Event"},
    {"move": "09", "title": "The CEO's Highest-Leverage Decisions",        "sub": "",                                     "date": "March 2027",           "loc": "Virtual",         "chair": "Asif Zaman",                 "cat": "Virtual Business Event"},
    {"move": "10", "title": "Turning Strategy into Execution",             "sub": "Through Management Systems",           "date": "April 2027",           "loc": "Virtual",         "chair": "Andrew Halliday",            "cat": "Virtual Business Event"},
    {"move": "11", "title": "Alignment, Legacy, and the Life We Are Building","sub": "",                                  "date": "April 9–11, 2027", "loc": "Aspen, CO",       "chair": "Glen Kunofsky",              "cat": "Optional Connection Experience"},
    {"move": "12", "title": "The Final Move",                              "sub": "Atlantic 13 in Spain",                 "date": "May 12–16, 2027",  "loc": "Valencia, Spain", "chair": "Richard Resnick",            "cat": "Core In-Person Event"},
    {"move": "13", "title": "AI Show & Tell",                              "sub": "What Leaders Are Actually Using",      "date": "June 2027",            "loc": "Virtual",         "chair": "Tara Fung",                  "cat": "Virtual Business Event"},
]

def make_pdf(path="A13_Calendar_2026-2027.pdf"):
    c = canvas.Canvas(path, pagesize=letter)
    c.setTitle("YPO Atlantic 13 · FY 2026–2027 Calendar")

    margin_x = 0.55 * inch
    margin_top = 0.5 * inch
    margin_bot = 0.45 * inch
    col_w = (W - 2 * margin_x) / 2
    usable_h = H - margin_top - margin_bot

    # ── Header bar ──────────────────────────────────────────
    hdr_h = 0.72 * inch
    c.setFillColor(NAVY)
    c.rect(0, H - hdr_h, W, hdr_h, fill=1, stroke=0)

    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 15)
    c.drawString(margin_x, H - hdr_h + 0.27 * inch, "YPO Atlantic 13")
    c.setFont("Helvetica", 9)
    c.setFillColor(colors.HexColor("#A8C4BC"))
    c.drawString(margin_x, H - hdr_h + 0.12 * inch, "FY 2026–2027 Learning Year Calendar")

    # right-align sub-text
    c.setFont("Helvetica", 8)
    c.setFillColor(colors.HexColor("#7AA898"))
    label = "Members Only · Confidential"
    c.drawRightString(W - margin_x, H - hdr_h + 0.19 * inch, label)

    # ── Legend ───────────────────────────────────────────────
    leg_y = H - hdr_h - 0.28 * inch
    dot_r = 4
    legend = [
        ("Core In-Person Event", NAVY),
        ("Virtual Business Event", TEAL),
        ("Optional Connection Experience", RUST),
    ]
    lx = margin_x
    for lbl, col in legend:
        c.setFillColor(col)
        c.circle(lx + dot_r, leg_y + 3, dot_r, fill=1, stroke=0)
        c.setFillColor(colors.HexColor("#444440"))
        c.setFont("Helvetica", 6.5)
        c.drawString(lx + dot_r * 2 + 4, leg_y + 1.5, lbl)
        lx += c.stringWidth(lbl, "Helvetica", 6.5) + dot_r * 2 + 18

    # thin rule under legend
    rule_y = leg_y - 7
    c.setStrokeColor(RULE)
    c.setLineWidth(0.5)
    c.line(margin_x, rule_y, W - margin_x, rule_y)

    # ── Events grid (2 columns) ──────────────────────────────
    card_start_y = rule_y - 8
    cards_area_h = card_start_y - margin_bot
    n = len(EVENTS)
    rows = (n + 1) // 2
    card_h = cards_area_h / rows
    pad = 7
    dot_size = 3

    for i, ev in enumerate(EVENTS):
        col = i % 2
        row = i // 2
        x = margin_x + col * col_w
        y = card_start_y - row * card_h

        accent = CAT_COLORS.get(ev["cat"], NAVY)

        # left accent strip
        c.setFillColor(accent)
        c.rect(x, y - card_h + pad * 0.6, 3, card_h - pad * 1.2, fill=1, stroke=0)

        cx = x + 10  # content x after strip

        # move number
        c.setFont("Helvetica-Bold", 6)
        c.setFillColor(accent)
        c.drawString(cx, y - pad - 1, f"EVENT {ev['move']}")

        # title
        title_y = y - pad - 12
        c.setFont("Helvetica-Bold", 8.5)
        c.setFillColor(NAVY)
        title = ev["title"]
        max_w = col_w - 18
        # word-wrap title to 2 lines if needed
        words = title.split()
        line1, line2 = "", ""
        for w in words:
            test = (line1 + " " + w).strip()
            if c.stringWidth(test, "Helvetica-Bold", 8.5) <= max_w:
                line1 = test
            else:
                line2 = (line2 + " " + w).strip()
        c.drawString(cx, title_y, line1)
        if line2:
            title_y -= 10
            c.drawString(cx, title_y, line2)

        # subtitle
        sub_y = title_y - 9
        if ev["sub"]:
            c.setFont("Helvetica-Oblique", 7)
            c.setFillColor(INK3)
            c.drawString(cx, sub_y, ev["sub"])
            sub_y -= 8

        # date · loc · chair
        detail_y = sub_y - 1
        c.setFont("Helvetica", 7)
        c.setFillColor(colors.HexColor("#333330"))
        c.drawString(cx, detail_y, ev["date"])
        detail_y -= 8
        c.setFillColor(INK3)
        c.drawString(cx, detail_y, f"{ev['loc']}  ·  Chair: {ev['chair']}")

        # bottom separator rule (skip last row right col if odd count)
        c.setStrokeColor(RULE)
        c.setLineWidth(0.4)
        if col == 1 or i == n - 1:
            c.line(margin_x, y - card_h + pad * 0.5, W - margin_x, y - card_h + pad * 0.5)
        # vertical divider
        if col == 0:
            c.line(margin_x + col_w, y - card_h + pad * 0.5, margin_x + col_w, y - pad * 0.3)

    # ── Footer ───────────────────────────────────────────────
    c.setFont("Helvetica", 6.5)
    c.setFillColor(INK3)
    c.drawCentredString(W / 2, margin_bot - 10, "YPO Atlantic 13  ·  FY 2026–2027  ·  For Members Only")

    c.save()
    print(f"PDF saved: {path}")

make_pdf()
