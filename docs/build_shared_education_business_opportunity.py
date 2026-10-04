from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
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
OUT = ROOT / "deliverables" / "Nebula_Tech_Shared_Education_Business_Opportunity.pdf"

NAVY = colors.HexColor("#102A43")
BLUE = colors.HexColor("#1769E0")
GREEN = colors.HexColor("#DFF5EC")
PALE_BLUE = colors.HexColor("#EEF5FF")
PALE_GREY = colors.HexColor("#F5F7FA")
MID_GREY = colors.HexColor("#5D6B7A")
GRID = colors.HexColor("#D3DCE6")
WHITE = colors.white
BLACK = colors.HexColor("#17212B")


def p(text, style):
    return Paragraph(text, style)


def make_styles():
    base = getSampleStyleSheet()
    return {
        "brand": ParagraphStyle(
            "Brand", parent=base["Normal"], fontName="Helvetica-Bold",
            fontSize=9, leading=11, textColor=BLUE, alignment=TA_CENTER,
            spaceAfter=5 * mm,
        ),
        "title": ParagraphStyle(
            "Title", parent=base["Title"], fontName="Helvetica-Bold",
            fontSize=24, leading=28, textColor=NAVY, alignment=TA_CENTER,
            spaceAfter=3 * mm,
        ),
        "subtitle": ParagraphStyle(
            "Subtitle", parent=base["Normal"], fontName="Helvetica",
            fontSize=11, leading=15.5, textColor=MID_GREY, alignment=TA_CENTER,
            spaceAfter=6 * mm,
        ),
        "h1": ParagraphStyle(
            "H1", parent=base["Heading1"], fontName="Helvetica-Bold",
            fontSize=16, leading=19, textColor=NAVY, spaceBefore=3 * mm,
            spaceAfter=3 * mm,
        ),
        "h2": ParagraphStyle(
            "H2", parent=base["Heading2"], fontName="Helvetica-Bold",
            fontSize=11, leading=13.5, textColor=NAVY, spaceBefore=1.5 * mm,
            spaceAfter=1 * mm,
        ),
        "body": ParagraphStyle(
            "Body", parent=base["BodyText"], fontName="Helvetica",
            fontSize=9.2, leading=13, textColor=BLACK, spaceAfter=2.2 * mm,
        ),
        "small": ParagraphStyle(
            "Small", parent=base["BodyText"], fontName="Helvetica",
            fontSize=7.5, leading=9.5, textColor=MID_GREY,
        ),
        "table": ParagraphStyle(
            "Table", parent=base["BodyText"], fontName="Helvetica",
            fontSize=8.3, leading=10.8, textColor=BLACK,
        ),
        "table_bold": ParagraphStyle(
            "TableBold", parent=base["BodyText"], fontName="Helvetica-Bold",
            fontSize=8.3, leading=10.8, textColor=NAVY,
        ),
        "table_header": ParagraphStyle(
            "TableHeader", parent=base["BodyText"], fontName="Helvetica-Bold",
            fontSize=8.3, leading=10.8, textColor=WHITE,
        ),
        "card_label": ParagraphStyle(
            "CardLabel", parent=base["Normal"], fontName="Helvetica-Bold",
            fontSize=7.7, leading=9, textColor=BLUE, alignment=TA_CENTER,
        ),
        "card_value": ParagraphStyle(
            "CardValue", parent=base["Normal"], fontName="Helvetica-Bold",
            fontSize=14.5, leading=17.5, textColor=NAVY, alignment=TA_CENTER,
        ),
        "card_note": ParagraphStyle(
            "CardNote", parent=base["Normal"], fontName="Helvetica",
            fontSize=7.4, leading=9, textColor=MID_GREY, alignment=TA_CENTER,
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
    canvas.drawString(doc.leftMargin, 8.3 * mm, "Nebula Tech | Shared education business opportunity | September 2026")
    canvas.drawRightString(A4[0] - doc.rightMargin, 8.3 * mm, f"Page {doc.page}")
    canvas.restoreState()


def three_cards(st):
    data = [
        [p("EXISTING LEARNER BASE", st["card_label"]), p("ENGLISH PATHWAY", st["card_label"]), p("STEM AND ENGINEERING", st["card_label"])],
        [p("First pilot audience", st["card_value"]), p("Partner-led", st["card_value"]), p("Nebula-led", st["card_value"])],
        [p("A route to real validation", st["card_note"]), p("Language expertise and content", st["card_note"]), p("Maths, physics and engineering", st["card_note"])],
    ]
    t = Table(data, colWidths=[56 * mm] * 3, rowHeights=[10 * mm, 16 * mm, 10 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE_BLUE),
        ("BOX", (0, 0), (-1, -1), 0.7, GRID),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, GRID),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
    ]))
    return t


def two_column(title_left, body_left, title_right, body_right, st):
    t = Table([
        [p(title_left, st["table_header"]), p(title_right, st["table_header"])],
        [p(body_left, st["table"]), p(body_right, st["table"])],
    ], colWidths=[84 * mm, 84 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("BACKGROUND", (0, 1), (-1, 1), PALE_GREY),
        ("BOX", (0, 0), (-1, -1), 0.6, GRID),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, GRID),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 2.8 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.8 * mm),
    ]))
    return t


def method_table(st):
    steps = [
        ("1", "Diagnose", "Identify level, goals, dates, materials and the real learning bottleneck."),
        ("2", "Plan", "Turn the objective into weekly priorities, practice blocks and visible milestones."),
        ("3", "Explain and practise", "Combine clear teaching, guided problem solving and targeted exercises."),
        ("4", "Review errors", "Use repeated mistakes and changing deadlines to adjust the route."),
        ("5", "Build independence", "Measure whether the learner can choose a method and detect errors unaided."),
    ]
    rows = [[p("Step", st["table_header"]), p("Method", st["table_header"]), p("How it appears on the platform", st["table_header"])]]
    for n, name, desc in steps:
        rows.append([p(n, st["table_bold"]), p(name, st["table_bold"]), p(desc, st["table"])])
    t = Table(rows, colWidths=[15 * mm, 38 * mm, 115 * mm])
    cmds = [
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("BOX", (0, 0), (-1, -1), 0.6, GRID),
        ("INNERGRID", (0, 0), (-1, -1), 0.45, GRID),
        ("ALIGN", (0, 1), (0, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 2.5 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 2.5 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 2.3 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.3 * mm),
    ]
    for row in (2, 4):
        cmds.append(("BACKGROUND", (0, row), (-1, row), PALE_GREY))
    t.setStyle(TableStyle(cmds))
    return t


def capital_table(st):
    rows = [
        [p("Initial use of capital", st["table_header"]), p("Amount", st["table_header"]), p("Purpose", st["table_header"])],
        [p("Phase 1 platform development", st["table_bold"]), p("EUR 1,250", st["table_bold"]), p("Maximum 50 hours for the shared pilot platform.", st["table"])],
        [p("First 3 months of cloud", st["table_bold"]), p("EUR 105-135", st["table_bold"]), p("Hosting, storage, delivery, users, progress data, logs and backups.", st["table"])],
        [p("First 3 months of technical care", st["table_bold"]), p("EUR 150", st["table_bold"]), p("Two hours of routine technical attention per month.", st["table"])],
        [p("Recommended working-capital ceiling", st["table_bold"]), p("EUR 1,550", st["table_bold"]), p("A simple rounded ceiling for the initial three-month pilot, excluding VAT, domain and marketing.", st["table_bold"])],
    ]
    t = Table(rows, colWidths=[62 * mm, 32 * mm, 74 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("BACKGROUND", (0, 2), (-1, 2), PALE_GREY),
        ("BACKGROUND", (0, -1), (-1, -1), GREEN),
        ("BOX", (0, 0), (-1, -1), 0.6, GRID),
        ("INNERGRID", (0, 0), (-1, -1), 0.45, GRID),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 2.6 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.6 * mm),
    ]))
    return t


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    st = make_styles()
    doc = BaseDocTemplate(
        str(OUT), pagesize=A4,
        leftMargin=21 * mm, rightMargin=21 * mm,
        topMargin=15 * mm, bottomMargin=17 * mm,
        title="Nebula Tech Shared Education Business Opportunity",
        author="Nebula Tech",
        subject="Non-binding proposal for a shared English and STEM learning platform",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="main")
    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=footer)])

    story = [
        p("Nebula Tech", st["brand"]),
        p("Shared education platform opportunity", st["title"]),
        p("A short proposal to combine English teaching, an existing learner base and STEM expertise in one scalable digital platform.", st["subtitle"]),
        three_cards(st),
        Spacer(1, 5 * mm),
        p("The opportunity", st["h1"]),
        p("The proposal is to expand the initial English learning platform into a shared education business. One partner leads the English pathway; the other contributes an existing learner network and leads mathematics, physics and engineering. Both use the same platform, operating structure and commercial channel instead of building separate products.", st["body"]),
        two_column(
            "Why the combination is valuable",
            "The English offer provides a broad learning market and a natural route to memberships and course packs. The STEM offer adds high-value specialist tutoring, exam preparation and engineering support. Existing learners allow the idea to be tested with real users before significant expansion.",
            "What the shared platform can become",
            "A single learner account with subject pathways, diagnostic intake, weekly plans, guided practice, saved progress and teacher feedback. The first pilot remains deliberately small; additional subjects, languages and commercial features are added only after measured demand.",
            st,
        ),
        Spacer(1, 4 * mm),
        p("The Nebula Method", st["h1"]),
        p("The approach does not simply sell teaching hours. It turns each session into part of a measurable plan and uses evidence of progress to decide what happens next.", st["body"]),
        method_table(st),
        Spacer(1, 3 * mm),
        p("Commercial paths to test", st["h1"]),
        p("Start with teacher-led packages that include platform access. Then test a monthly membership or focused course pack, followed by small cohort or academy pilots. The objective is to validate willingness to pay, learner retention and delivery effort before investing in a larger catalogue.", st["body"]),
        PageBreak(),
        p("Proposed pilot agreement", st["h1"]),
        p("A practical starting structure for funding, responsibilities and profit sharing. This is a discussion proposal, not a final legal agreement.", st["body"]),
        p("Initial capital", st["h1"]),
        capital_table(st),
        Spacer(1, 4 * mm),
        p("<b>Suggested funding:</b> contribute the EUR 1,550 ceiling equally at EUR 775 each. If one party contributes more cash, the documented excess is repaid before profits are divided. Work or content replaces cash only when its scope and value are agreed in writing beforehand.", st["body"]),
        p("Roles and contributions", st["h1"]),
        p("<b>English partner:</b> lead the English curriculum, language quality, launch content and English learner proposition. <b>Nebula and STEM partner:</b> provide the Nebula Method, existing learner access and mathematics, physics and engineering expertise, while coordinating development and technical operations. <b>Shared:</b> pricing, product priorities, quality and commercial decisions.", st["body"]),
        p("Proposed profit-sharing flow", st["h1"]),
    ]

    profit = Table([
        [p("1  Gross revenue", st["table_header"]), p("2  Direct costs", st["table_header"]), p("3  Capital recovery", st["table_header"]), p("4  Net profit", st["table_header"])],
        [p("All customer payments received by the shared offer.", st["table"]), p("Payment fees, refunds, cloud, care and jointly approved marketing or content costs.", st["table"]), p("Repay documented initial contributions in proportion to the cash provided.", st["table"]), p("Suggested starting point: divide the remaining distributable profit 50/50.", st["table_bold"])],
    ], colWidths=[42 * mm] * 4)
    profit.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("BACKGROUND", (0, 1), (-1, 1), PALE_GREY),
        ("BOX", (0, 0), (-1, -1), 0.6, GRID),
        ("INNERGRID", (0, 0), (-1, -1), 0.45, GRID),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 2.5 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 2.5 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 2.7 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.7 * mm),
    ]))
    story += [
        profit,
        Spacer(1, 3 * mm),
        KeepTogether([
            p("Pilot and agreement safeguards", st["h1"]),
            p("Before spending, agree the audience, content, accounts, data duties, pricing, commitments and exit process. Run an 8-12 week pilot and review conversion, repeat use, completion, support time and revenue per learner. Existing materials remain with their creator; platform ownership, taxes, confidentiality and termination require a signed agreement reviewed by legal and tax advisers.", st["body"]),
            Table([[p("Proposed next step: agree the two pilot pathways, confirm the EUR 1,550 capital ceiling and prepare a short founders agreement before development begins.", st["decision"])]], colWidths=[168 * mm], style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), PALE_BLUE),
                ("BOX", (0, 0), (-1, -1), 0.7, GRID),
                ("LEFTPADDING", (0, 0), (-1, -1), 5 * mm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5 * mm),
                ("TOPPADDING", (0, 0), (-1, -1), 4 * mm),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4 * mm),
            ])),
            Spacer(1, 2.5 * mm),
            p("Method source: metodonebula.es/metodologia/ (reviewed 12 September 2026).", st["small"]),
        ]),
    ]

    doc.build(story)
    print(OUT)


if __name__ == "__main__":
    build()
