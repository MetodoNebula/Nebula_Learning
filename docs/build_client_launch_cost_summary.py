from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "deliverables" / "Nebula_Tech_Client_Launch_Cost_Summary.pdf"

NAVY = colors.HexColor("#102A43")
BLUE = colors.HexColor("#1769E0")
TEAL = colors.HexColor("#087F75")
GREEN = colors.HexColor("#DFF5EC")
PALE_BLUE = colors.HexColor("#EEF5FF")
PALE_GREY = colors.HexColor("#F5F7FA")
MID_GREY = colors.HexColor("#5D6B7A")
GRID = colors.HexColor("#D3DCE6")
WHITE = colors.white
BLACK = colors.HexColor("#17212B")


def p(text, style):
    return Paragraph(text, style)


def styles():
    base = getSampleStyleSheet()
    return {
        "brand": ParagraphStyle(
            "Brand", parent=base["Normal"], fontName="Helvetica-Bold",
            fontSize=9, leading=11, textColor=BLUE, alignment=TA_CENTER,
            spaceAfter=5 * mm,
        ),
        "title": ParagraphStyle(
            "Title", parent=base["Title"], fontName="Helvetica-Bold",
            fontSize=25, leading=29, textColor=NAVY, alignment=TA_CENTER,
            spaceAfter=3 * mm,
        ),
        "subtitle": ParagraphStyle(
            "Subtitle", parent=base["Normal"], fontName="Helvetica",
            fontSize=11.2, leading=16, textColor=MID_GREY, alignment=TA_CENTER,
            spaceAfter=7 * mm,
        ),
        "h1": ParagraphStyle(
            "H1", parent=base["Heading1"], fontName="Helvetica-Bold",
            fontSize=16, leading=19, textColor=NAVY, spaceBefore=3 * mm,
            spaceAfter=3 * mm,
        ),
        "h2": ParagraphStyle(
            "H2", parent=base["Heading2"], fontName="Helvetica-Bold",
            fontSize=11.5, leading=14, textColor=NAVY, spaceBefore=2 * mm,
            spaceAfter=1.5 * mm,
        ),
        "body": ParagraphStyle(
            "Body", parent=base["BodyText"], fontName="Helvetica",
            fontSize=9.4, leading=13.2, textColor=BLACK, spaceAfter=2.2 * mm,
        ),
        "small": ParagraphStyle(
            "Small", parent=base["BodyText"], fontName="Helvetica",
            fontSize=7.8, leading=10.2, textColor=MID_GREY,
        ),
        "table": ParagraphStyle(
            "Table", parent=base["BodyText"], fontName="Helvetica",
            fontSize=8.2, leading=10.7, textColor=BLACK,
        ),
        "table_bold": ParagraphStyle(
            "TableBold", parent=base["BodyText"], fontName="Helvetica-Bold",
            fontSize=8.2, leading=10.7, textColor=NAVY,
        ),
        "table_header": ParagraphStyle(
            "TableHeader", parent=base["BodyText"], fontName="Helvetica-Bold",
            fontSize=8.2, leading=10.7, textColor=WHITE,
        ),
        "card_label": ParagraphStyle(
            "CardLabel", parent=base["Normal"], fontName="Helvetica-Bold",
            fontSize=7.7, leading=9, textColor=BLUE, alignment=TA_CENTER,
        ),
        "card_value": ParagraphStyle(
            "CardValue", parent=base["Normal"], fontName="Helvetica-Bold",
            fontSize=17, leading=20, textColor=NAVY, alignment=TA_CENTER,
        ),
        "card_note": ParagraphStyle(
            "CardNote", parent=base["Normal"], fontName="Helvetica",
            fontSize=7.4, leading=9, textColor=MID_GREY, alignment=TA_CENTER,
        ),
        "total": ParagraphStyle(
            "Total", parent=base["BodyText"], fontName="Helvetica-Bold",
            fontSize=8.5, leading=11, textColor=NAVY,
        ),
        "decision": ParagraphStyle(
            "Decision", parent=base["BodyText"], fontName="Helvetica-Bold",
            fontSize=10.2, leading=14, textColor=NAVY, alignment=TA_CENTER,
        ),
    }


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(GRID)
    canvas.setLineWidth(0.5)
    canvas.line(doc.leftMargin, 13 * mm, A4[0] - doc.rightMargin, 13 * mm)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MID_GREY)
    canvas.drawString(doc.leftMargin, 8.3 * mm, "Nebula Tech | Client launch cost summary | September 2026")
    canvas.drawRightString(A4[0] - doc.rightMargin, 8.3 * mm, f"Page {doc.page}")
    canvas.restoreState()


def cost_cards(st):
    data = [
        [p("FIXED INITIAL LAUNCH", st["card_label"]), p("CLOUD INFRASTRUCTURE", st["card_label"]), p("ROUTINE TECHNICAL CARE", st["card_label"])],
        [p("EUR 1,250", st["card_value"]), p("EUR 35-45 / month", st["card_value"]), p("EUR 50 / month", st["card_value"])],
        [p("Maximum 50 hours", st["card_note"]), p("Estimated AWS usage", st["card_note"]), p("2 hours of human support", st["card_note"])],
    ]
    table = Table(data, colWidths=[56 * mm, 56 * mm, 56 * mm], rowHeights=[10 * mm, 17 * mm, 10 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE_BLUE),
        ("BOX", (0, 0), (-1, -1), 0.7, GRID),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, GRID),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
    ]))
    return table


def hour_table(st):
    rows = [
        ["Work area", "What the client receives", "Hours", "Value"],
        ["Content and launch review", "Review the first lessons, supplied assets, priorities and acceptance checklist.", "6", "EUR 150"],
        ["Core learning platform", "Adapt the existing prototype into a stable, branded and responsive first release.", "12", "EUR 300"],
        ["Users and saved progress", "Secure sign-in, learner records, completed lessons and progress persistence.", "8", "EUR 200"],
        ["Media and cloud preparation", "Organise approved Dropbox assets and configure efficient cloud storage and delivery.", "8", "EUR 200"],
        ["Deployment and safeguards", "Publish the service and configure HTTPS, basic monitoring, backups and cost alerts.", "8", "EUR 200"],
        ["Testing and handover", "Test key desktop and mobile journeys, fix launch blockers and hand over access.", "6", "EUR 150"],
        ["Launch contingency", "Small allowance for routine fixes or adjustments within the agreed Phase 1 scope.", "2", "EUR 50"],
        ["Maximum Phase 1 total", "The allocation may move slightly between work areas, but the fixed cap does not increase without approval.", "50", "EUR 1,250"],
    ]
    formatted = []
    for r, row in enumerate(rows):
        style = st["total"] if r == len(rows) - 1 else (st["table_bold"] if r > 0 else st["table_bold"])
        if r == 0:
            formatted.append([p(x, st["table_header"]) for x in row])
        else:
            formatted.append([
                p(row[0], style), p(row[1], st["table"]), p(row[2], style), p(row[3], style)
            ])
    table = Table(formatted, colWidths=[40 * mm, 91 * mm, 16 * mm, 21 * mm], repeatRows=1)
    commands = [
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("BOX", (0, 0), (-1, -1), 0.6, GRID),
        ("INNERGRID", (0, 0), (-1, -1), 0.45, GRID),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (2, 1), (-1, -1), "CENTER"),
        ("LEFTPADDING", (0, 0), (-1, -1), 2.2 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 2.2 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 2.2 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.2 * mm),
        ("BACKGROUND", (0, -1), (-1, -1), GREEN),
    ]
    for r in range(2, len(rows) - 1, 2):
        commands.append(("BACKGROUND", (0, r), (-1, r), PALE_GREY))
    table.setStyle(TableStyle(commands))
    return table


def two_column_box(left_title, left_body, right_title, right_body, st, widths=(84 * mm, 84 * mm)):
    data = [
        [p(left_title, st["table_header"]), p(right_title, st["table_header"])],
        [p(left_body, st["table"]), p(right_body, st["table"])],
    ]
    table = Table(data, colWidths=list(widths))
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("BACKGROUND", (0, 1), (-1, 1), PALE_GREY),
        ("BOX", (0, 0), (-1, -1), 0.6, GRID),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, GRID),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 2.7 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.7 * mm),
    ]))
    return table


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    st = styles()
    doc = BaseDocTemplate(
        str(OUT), pagesize=A4,
        leftMargin=21 * mm, rightMargin=21 * mm,
        topMargin=18 * mm, bottomMargin=19 * mm,
        title="Nebula Tech Client Launch Cost Summary",
        author="Nebula Tech",
        subject="Client-facing phased launch estimate",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="main")
    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=footer)])

    story = [
        p("Nebula Tech", st["brand"]),
        p("Client launch cost summary", st["title"]),
        p("A clear, capped first release for an English learning platform, followed by predictable monthly operating costs.", st["subtitle"]),
        cost_cards(st),
        Spacer(1, 5 * mm),
        p("How the 50 launch hours are used", st["h1"]),
        p("The fixed launch price is based on a maximum of 50 hours at EUR 25 per hour. Each work area produces a visible client result; no additional Phase 1 hours are charged without prior approval.", st["body"]),
        hour_table(st),
        Spacer(1, 3.5 * mm),
        PageBreak(),
        p("Nebula Tech", st["brand"]),
        p("Costs after launch", st["title"]),
        p("The ongoing cost has two separate parts: cloud infrastructure and human technical care. Keeping them separate makes the monthly bill easy to understand and control.", st["subtitle"]),
        two_column_box(
            "1  Cloud infrastructure  EUR 35-45 per month",
            "A planning allowance for AWS hosting, media storage and delivery, user authentication, the progress database, logs, backups, basic web protection and a small usage reserve.<br/><br/><b>Paid for:</b> keeping the platform online and serving content.<br/><b>Main variable:</b> video and media traffic.<br/><b>Basis:</b> about 1,000 monthly learners, up to 750 GB of monthly media delivery and 150 GB stored.",
            "2  Routine technical care  EUR 50 per month",
            "Two hours of human support at EUR 25 per hour. This covers a short monthly service check, review of alerts and cloud spend, routine dependency or configuration updates, backup checks and small operational issues.<br/><br/><b>Paid for:</b> continued technical attention.<br/><b>Not included:</b> new features or content production.<br/><b>Extra work:</b> quoted and approved separately at EUR 25 per hour.",
            st,
        ),
        Spacer(1, 5 * mm),
        p("First-year planning view", st["h1"]),
    ]

    first_year = Table([
        [p("Cost component", st["table_header"]), p("Year 1", st["table_header"]), p("Explanation", st["table_header"])],
        [p("Fixed Phase 1 launch", st["table_bold"]), p("EUR 1,250", st["table_bold"]), p("One-time delivery, capped at 50 hours.", st["table"])],
        [p("Cloud infrastructure", st["table_bold"]), p("EUR 420-540", st["table_bold"]), p("Twelve months at EUR 35-45 per month.", st["table"])],
        [p("Routine technical care", st["table_bold"]), p("EUR 600", st["table_bold"]), p("Twelve months at EUR 50 per month.", st["table"])],
        [p("Expected first-year total", st["total"]), p("EUR 2,270-2,390", st["total"]), p("Excluding VAT, domain registration and optional additions.", st["total"])],
    ], colWidths=[55 * mm, 35 * mm, 78 * mm])
    first_year.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("BACKGROUND", (0, 2), (-1, 2), PALE_GREY),
        ("BACKGROUND", (0, -1), (-1, -1), GREEN),
        ("BOX", (0, 0), (-1, -1), 0.6, GRID),
        ("INNERGRID", (0, 0), (-1, -1), 0.45, GRID),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 2.4 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.4 * mm),
    ]))
    story += [first_year, Spacer(1, 4 * mm)]
    story += [
        p("Scope boundary", st["h1"]),
        p("<b>Included:</b> one responsive English learning web product, secure login, saved progress, exercises, supplied media, one agreed content batch, cloud deployment, monitoring, backups and handover.<br/><b>Not included:</b> native apps, payments, live classes, teacher or academy portals, bespoke integrations, new content or media production, translation, redesign, legal review or a formal SLA.", st["body"]),
        p("<b>Optional growth:</b> future work is quoted only when needed. Examples include a new level (EUR 200-300), language pair (EUR 300-500), payments (EUR 400-600), teacher workspace (EUR 600-900) or academy workspace (EUR 600-1,000).", st["body"]),
        KeepTogether([
            p("Commercial assumptions", st["h1"]),
            p("All prices exclude VAT. The client supplies approved texts and existing media, owns the required accounts and provides timely feedback. The cloud amount is a planning allowance and should be reviewed if traffic, user volume or security requirements change materially.", st["body"]),
            Table([[p("Approve Phase 1 at a fixed maximum of 50 hours / EUR 1,250. Ongoing infrastructure and care begin after launch; every optional extension is quoted and approved separately.", st["decision"])]], colWidths=[168 * mm], style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), PALE_BLUE),
                ("BOX", (0, 0), (-1, -1), 0.7, GRID),
                ("LEFTPADDING", (0, 0), (-1, -1), 5 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 4 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4 * mm),
            ])),
        ]),
    ]

    doc.build(story)
    print(OUT)


if __name__ == "__main__":
    build()
