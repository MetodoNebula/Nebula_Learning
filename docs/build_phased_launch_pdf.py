from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "deliverables" / "Nebula_Tech_Phased_Launch_Proposal.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)

NAVY = colors.HexColor("#10253F")
BLUE = colors.HexColor("#1570EF")
SKY = colors.HexColor("#EAF2FF")
GREEN = colors.HexColor("#0B7A54")
PALE_GREEN = colors.HexColor("#E8F7F0")
INK = colors.HexColor("#1B2B3A")
MUTED = colors.HexColor("#607080")
LINE = colors.HexColor("#D7E0EA")
WHITE = colors.white


def register_fonts():
    fonts = Path("C:/Windows/Fonts")
    pdfmetrics.registerFont(TTFont("Nebula", str(fonts / "arial.ttf")))
    pdfmetrics.registerFont(TTFont("NebulaBold", str(fonts / "arialbd.ttf")))


def styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "title", parent=base["Title"], fontName="NebulaBold", fontSize=26,
            leading=31, textColor=NAVY, spaceAfter=6,
        ),
        "subtitle": ParagraphStyle(
            "subtitle", parent=base["Normal"], fontName="Nebula", fontSize=11.5,
            leading=16, textColor=MUTED, spaceAfter=16,
        ),
        "h1": ParagraphStyle(
            "h1", parent=base["Heading1"], fontName="NebulaBold", fontSize=16,
            leading=20, textColor=NAVY, spaceBefore=3, spaceAfter=8,
        ),
        "h2": ParagraphStyle(
            "h2", parent=base["Heading2"], fontName="NebulaBold", fontSize=11.5,
            leading=14, textColor=NAVY, spaceBefore=6, spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "body", parent=base["BodyText"], fontName="Nebula", fontSize=9.3,
            leading=13, textColor=INK, spaceAfter=5,
        ),
        "small": ParagraphStyle(
            "small", parent=base["BodyText"], fontName="Nebula", fontSize=7.8,
            leading=10.5, textColor=MUTED,
        ),
        "card_label": ParagraphStyle(
            "card_label", parent=base["Normal"], fontName="NebulaBold", fontSize=8.2,
            leading=10, textColor=BLUE, alignment=TA_CENTER,
        ),
        "card_value": ParagraphStyle(
            "card_value", parent=base["Normal"], fontName="NebulaBold", fontSize=17,
            leading=20, textColor=NAVY, alignment=TA_CENTER,
        ),
        "card_note": ParagraphStyle(
            "card_note", parent=base["Normal"], fontName="Nebula", fontSize=7.7,
            leading=10, textColor=MUTED, alignment=TA_CENTER,
        ),
        "table": ParagraphStyle(
            "table", parent=base["BodyText"], fontName="Nebula", fontSize=8.1,
            leading=10.3, textColor=INK,
        ),
        "table_bold": ParagraphStyle(
            "table_bold", parent=base["BodyText"], fontName="NebulaBold", fontSize=8.1,
            leading=10.3, textColor=NAVY,
        ),
        "table_head": ParagraphStyle(
            "table_head", parent=base["BodyText"], fontName="NebulaBold", fontSize=8.1,
            leading=10.3, textColor=WHITE,
        ),
        "callout": ParagraphStyle(
            "callout", parent=base["BodyText"], fontName="Nebula", fontSize=9.1,
            leading=13, textColor=NAVY,
        ),
    }


def p(text, style):
    return Paragraph(text, style)


def bullets(items, st):
    return [p(f"&#8226; {item}", st["body"]) for item in items]


def footer(canvas, doc):
    canvas.saveState()
    w, _ = A4
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(doc.leftMargin, 14 * mm, w - doc.rightMargin, 14 * mm)
    canvas.setFont("Nebula", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(doc.leftMargin, 9.5 * mm, "Nebula Tech | Phased launch proposal | 11 September 2026")
    canvas.drawRightString(w - doc.rightMargin, 9.5 * mm, f"Page {doc.page}")
    canvas.restoreState()


def callout(text, st, background=SKY):
    table = Table([[p(text, st["callout"])]], colWidths=[170 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), background),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 5 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 4 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4 * mm),
    ]))
    return table


def build():
    register_fonts()
    st = styles()
    doc = SimpleDocTemplate(
        str(OUT), pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
        topMargin=18 * mm, bottomMargin=21 * mm,
        title="Nebula Tech Phased Launch Proposal",
        author="Nebula Tech",
    )
    story = []

    story += [
        p("Nebula Tech", st["card_label"]),
        Spacer(1, 5 * mm),
        p("Phased launch proposal", st["title"]),
        p("A lean, production-ready English learning platform with a clear initial price, predictable monthly care, and optional growth milestones.", st["subtitle"]),
    ]

    cards = [
        [p("INITIAL DELIVERY", st["card_label"]), p("CLOUD RUNNING COST", st["card_label"]), p("PLATFORM CARE", st["card_label"])],
        [p("50 h maximum", st["card_value"]), p("EUR 35-45 / month", st["card_value"]), p("EUR 50 / month", st["card_value"])],
        [p("EUR 1,250 fixed launch cap", st["card_note"]), p("for about 1,000 regular learners", st["card_note"]), p("2 hours of routine care", st["card_note"])],
    ]
    cards_table = Table(cards, colWidths=[56.7 * mm] * 3)
    cards_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FBFF")),
        ("BOX", (0, 0), (-1, -1), 0.7, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
        ("TOPPADDING", (0, 0), (-1, -1), 4 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4 * mm),
        ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
    ]))
    story += [cards_table, Spacer(1, 7 * mm)]

    story += [
        p("Recommended commercial structure", st["h1"]),
        callout("<b>The client buys a small, usable first release - not a speculative 160-hour programme.</b> The existing prototype, managed cloud services, and AI-assisted delivery reduce implementation time. The initial scope is capped at 50 hours, then the platform is cared for monthly and expanded only when there is demand.", st),
        Spacer(1, 5 * mm),
        p("Phase 1: fixed initial launch", st["h2"]),
    ]
    phase_table = Table([
        [p("Included", st["table_head"]), p("Commercial boundary", st["table_head"])],
        [p("One web platform for German-speaking learners studying English, with responsive mobile use.", st["table"]), p("One language pair, one visual identity and an agreed first content batch.", st["table"])],
        [p("Login, learner progress, varied exercise types, pre-generated audio/video assets and basic content administration flow.", st["table"]), p("Existing media is supplied ready to upload. New video, audio recording, teaching content and translation are quoted separately.", st["table"])],
        [p("AWS deployment, asset storage, database, simple monitoring, backups and launch handover.", st["table"]), p("No native app, payment system, live class system, teacher portal or bespoke integrations in this phase.", st["table"])],
    ], colWidths=[85 * mm, 85 * mm], repeatRows=1)
    phase_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#FBFCFE")),
        ("GRID", (0, 0), (-1, -1), 0.45, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 3.5 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5 * mm),
        ("LEFTPADDING", (0, 0), (-1, -1), 3.5 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3.5 * mm),
    ]))
    story += [phase_table, Spacer(1, 6 * mm)]
    story += [
        p("First-year planning view", st["h2"]),
        p("Initial delivery: <b>EUR 1,250</b>. With cloud costs and routine care for 12 months, the expected first-year platform spend is <b>EUR 2,270-2,390</b>, excluding VAT, domain registration and optional extensions.", st["body"]),
        p("This keeps the first commitment small while preserving an architecture that can grow into a fuller teaching business.", st["body"]),
        PageBreak(),
    ]

    story += [
        p("Phase 1 delivery plan", st["title"]),
        p("The delivery estimate is deliberately practical. AI-assisted implementation speeds up routine coding, but the budget still includes the work that must be done carefully: scope decisions, integration, security checks, real testing and launch.", st["subtitle"]),
    ]
    milestones = [
        ("1. Scope and content intake", "Confirm first lessons, asset inventory, acceptance criteria and launch checklist.", "4 h"),
        ("2. Cloud foundation and asset migration", "Set up the AWS account structure, storage, CDN delivery, environment settings and import existing Dropbox assets.", "10 h"),
        ("3. Learner accounts and progress", "Configure secure sign-in, user data model and persistence for progress and completed lessons.", "8 h"),
        ("4. Learning experience integration", "Adapt the existing responsive prototype into the agreed English release, connect the content and validate exercise flows.", "12 h"),
        ("5. Deployment and observability", "Deploy the web service, configure basic logs, error checks, backup policy and a cloud budget alert.", "8 h"),
        ("6. Quality assurance and handover", "Test desktop and mobile journeys, fix launch blockers, document operations and hand over access.", "6 h"),
    ]
    rows = [[p("Milestone", st["table_head"]), p("Deliverable", st["table_head"]), p("Hours", st["table_head"])]]
    for name, deliverable, hours in milestones:
        rows.append([p(name, st["table_bold"]), p(deliverable, st["table"]), p(hours, st["table"])])
    rows.append([p("Planned implementation", st["table_bold"]), p("Includes AI-assisted development and an existing prototype.", st["table"]), p("48 h", st["table_bold"])])
    rows.append([p("Fixed commercial cap", st["table_bold"]), p("A small contingency is reserved inside the quote for routine launch fixes.", st["table"]), p("50 h", st["table_bold"])])
    milestone_table = Table(rows, colWidths=[47 * mm, 101 * mm, 22 * mm], repeatRows=1)
    milestone_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("BACKGROUND", (0, 1), (-1, -3), colors.HexColor("#FBFCFE")),
        ("BACKGROUND", (0, -2), (-1, -1), PALE_GREEN),
        ("GRID", (0, 0), (-1, -1), 0.45, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 3 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3 * mm),
        ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
    ]))
    story += [milestone_table, Spacer(1, 7 * mm)]
    story += [
        p("Monthly platform care after launch", st["h1"]),
        p("<b>EUR 50 per month (2 hours at EUR 25/hour)</b>. This is a light, practical service for a small first release.", st["body"]),
    ]
    care = Table([
        [p("Included each month", st["table_head"]), p("Outside the monthly allowance", st["table_head"])],
        [p("Review service availability, alerts and cloud spend; apply routine dependency or configuration updates; check backups; respond to small operational issues.", st["table"]), p("New features, new lesson production, design changes, major incidents, third-party integrations and work above 2 hours. These are approved as separate mini-milestones at EUR 25/hour.", st["table"])],
    ], colWidths=[85 * mm, 85 * mm])
    care.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY), ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#FBFCFE")), ("GRID", (0, 0), (-1, -1), 0.45, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"), ("TOPPADDING", (0, 0), (-1, -1), 4 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4 * mm), ("LEFTPADDING", (0, 0), (-1, -1), 3.5 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3.5 * mm),
    ]))
    story += [care, Spacer(1, 5 * mm), callout("<b>Cloud budget:</b> EUR 35-45/month for a regular audience of about 1,000 monthly learners. This covers a lean AWS setup: hosted application, media storage and delivery, user authentication, progress database, logs, basic web protection and a small cost reserve.", st, PALE_GREEN), PageBreak()]

    story += [
        p("Growth is optional and priced by milestone", st["title"]),
        p("The launch architecture separates learning content, user data and media delivery so that expansion does not require a substantial refactor. Each next step is approved only when it supports a real teaching or business goal.", st["subtitle"]),
    ]
    expansion_rows = [
        [p("Optional milestone", st["table_head"]), p("Typical effort", st["table_head"]), p("Client budget", st["table_head"]), p("What it covers", st["table_head"])],
        [p("Add a level or content pack", st["table"]), p("8-12 h", st["table"]), p("EUR 200-300", st["table"]), p("Configure an agreed batch of existing lessons and media. Teaching content creation is separate.", st["table"])],
        [p("Add a language pair", st["table"]), p("12-20 h", st["table"]), p("EUR 300-500", st["table"]), p("Reuse the exercise engine with new copy, content structure and supplied assets.", st["table"])],
        [p("Teacher workspace", st["table"]), p("24-36 h", st["table"]), p("EUR 600-900", st["table"]), p("Groups, assignments and a basic learner progress view.", st["table"])],
        [p("Subscriptions and payments", st["table"]), p("16-24 h", st["table"]), p("EUR 400-600", st["table"]), p("Checkout, membership status and account access. Payment provider fees are separate.", st["table"])],
        [p("School / academy workspace", st["table"]), p("24-40 h", st["table"]), p("EUR 600-1,000", st["table"]), p("Organisation roles, class imports and basic reporting.", st["table"])],
        [p("Installable PWA experience", st["table"]), p("16-24 h", st["table"]), p("EUR 400-600", st["table"]), p("Home-screen install, offline-friendly shell and mobile release polish.", st["table"])],
    ]
    expansion = Table(expansion_rows, colWidths=[40 * mm, 27 * mm, 31 * mm, 72 * mm], repeatRows=1)
    expansion.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY), ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#FBFCFE")), ("GRID", (0, 0), (-1, -1), 0.45, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"), ("TOPPADDING", (0, 0), (-1, -1), 3 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3 * mm), ("LEFTPADDING", (0, 0), (-1, -1), 2.7 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 2.7 * mm),
    ]))
    story += [expansion, Spacer(1, 7 * mm)]
    story += [
        p("Commercial assumptions", st["h1"]),
        *bullets([
            "All estimates are excluding VAT and are based on a EUR 25 hourly rate.",
            "The client provides account ownership, approved texts, existing media and timely review feedback.",
            "The launch estimate assumes a single English learning product for German-speaking learners, an agreed first content batch, and no bespoke integration.",
            "Cloud pricing is a planning allowance, not a fixed AWS quote. It should be reviewed if media traffic, user volume or security requirements materially change.",
            "AI-assisted delivery is already reflected in the lower initial hours. It shortens routine build work, while planning, quality checks and accountable release work remain included.",
        ], st),
        p("Pricing basis", st["h2"]),
        p("AWS pricing checked on 11 September 2026. The monthly cloud allowance uses AWS Lightsail Containers, Amazon S3, Amazon CloudFront, Amazon Cognito, Amazon DynamoDB, Amazon CloudWatch, AWS WAF and Amazon Route 53 in the EU (Ireland) region. Reference pages: aws.amazon.com/lightsail/pricing, aws.amazon.com/s3/pricing, aws.amazon.com/cloudfront/pricing, aws.amazon.com/cognito/pricing, aws.amazon.com/dynamodb/pricing, aws.amazon.com/cloudwatch/pricing, aws.amazon.com/waf/pricing and aws.amazon.com/route53/pricing.", st["small"]),
        Spacer(1, 4 * mm),
        callout("<b>Decision requested:</b> approve Phase 1 at a fixed cap of 50 hours / EUR 1,250, then keep the platform under a light EUR 50/month care plan. Future features remain optional, visible and separately approved.", st),
    ]

    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(OUT)


if __name__ == "__main__":
    build()
