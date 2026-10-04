from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "deliverables"
OUT.mkdir(exist_ok=True)

NAVY = "17324D"
TEAL = "0F766E"
PALE = "F2F6F8"
WHITE = "FFFFFF"
GRAY = "D9D9D9"
TEXT = "202124"
FX_USD_PER_EUR = 1.1652


def shade(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def borders(cell, color=GRAY):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_borders = tc_pr.first_child_found_in("w:tcBorders")
    if tc_borders is None:
        tc_borders = OxmlElement("w:tcBorders")
        tc_pr.append(tc_borders)
    for edge in ("top", "left", "bottom", "right"):
        tag = qn(f"w:{edge}")
        element = tc_borders.find(tag)
        if element is None:
            element = OxmlElement(f"w:{edge}")
            tc_borders.append(element)
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), "6")
        element.set(qn("w:color"), color)


def cell_margins(cell, top=90, start=110, bottom=90, end=110):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for side, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{side}"))
        if node is None:
            node = OxmlElement(f"w:{side}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_cell_text(cell, text, bold=False, color=TEXT, size=9.4, align=None):
    cell.text = ""
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    if align is not None:
        p.alignment = align
    r = p.add_run(str(text))
    r.bold = bold
    r.font.name = "Aptos"
    r._element.rPr.rFonts.set(qn("w:ascii"), "Aptos")
    r._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos")
    r.font.size = Pt(size)
    r.font.color.rgb = RGBColor.from_string(color)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    cell_margins(cell)
    borders(cell)


def add_hyperlink(paragraph, text, url):
    part = paragraph.part
    r_id = part.relate_to(url, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink", is_external=True)
    link = OxmlElement("w:hyperlink")
    link.set(qn("r:id"), r_id)
    run = OxmlElement("w:r")
    r_pr = OxmlElement("w:rPr")
    color = OxmlElement("w:color")
    color.set(qn("w:val"), TEAL)
    r_pr.append(color)
    underline = OxmlElement("w:u")
    underline.set(qn("w:val"), "single")
    r_pr.append(underline)
    run.append(r_pr)
    text_node = OxmlElement("w:t")
    text_node.text = text
    run.append(text_node)
    link.append(run)
    paragraph._p.append(link)


def add_page_number(paragraph):
    run = paragraph.add_run("Page ")
    fld_char1 = OxmlElement("w:fldChar")
    fld_char1.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = " PAGE "
    fld_char2 = OxmlElement("w:fldChar")
    fld_char2.set(qn("w:fldCharType"), "end")
    run._r.append(fld_char1)
    run._r.append(instr)
    run._r.append(fld_char2)


def setup_doc(title, subtitle):
    doc = Document()
    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(0.75)
    section.bottom_margin = Inches(0.7)
    section.left_margin = Inches(0.78)
    section.right_margin = Inches(0.78)
    normal = doc.styles["Normal"]
    normal.font.name = "Aptos"
    normal._element.rPr.rFonts.set(qn("w:ascii"), "Aptos")
    normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos")
    normal.font.size = Pt(10.5)
    normal.font.color.rgb = RGBColor.from_string(TEXT)
    normal.paragraph_format.space_after = Pt(7)
    normal.paragraph_format.line_spacing = 1.12
    for name, size in (("Title", 23), ("Heading 1", 15), ("Heading 2", 11.8), ("Heading 3", 10.8)):
        style = doc.styles[name]
        style.font.name = "Aptos Display" if name == "Title" else "Aptos"
        style._element.rPr.rFonts.set(qn("w:ascii"), style.font.name)
        style._element.rPr.rFonts.set(qn("w:hAnsi"), style.font.name)
        style.font.size = Pt(size)
        style.font.bold = True
        style.font.color.rgb = RGBColor(0, 0, 0)
        style.paragraph_format.space_before = Pt(16 if name == "Heading 1" else 10)
        style.paragraph_format.space_after = Pt(6)
    title_ppr = doc.styles["Title"].element.get_or_add_pPr()
    title_border = title_ppr.find(qn("w:pBdr"))
    if title_border is not None:
        title_ppr.remove(title_border)
    properties = doc.core_properties
    properties.title = title
    properties.subject = subtitle
    properties.author = "Nebula Tech"
    p = doc.add_paragraph(style="Title")
    p.add_run(title)
    p.paragraph_format.space_after = Pt(4)
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(18)
    r = p.add_run(subtitle)
    r.italic = True
    r.font.size = Pt(11)
    r.font.color.rgb = RGBColor.from_string(TEAL)
    footer = section.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    footer.paragraph_format.space_before = Pt(6)
    footer.add_run("Nebula Tech | September 2026 | ").font.size = Pt(8)
    add_page_number(footer)
    for run in footer.runs:
        run.font.color.rgb = RGBColor.from_string("606B74")
    return doc


def para(doc, text, bold_lead=None):
    p = doc.add_paragraph()
    if bold_lead and text.startswith(bold_lead):
        lead = p.add_run(bold_lead)
        lead.bold = True
        p.add_run(text[len(bold_lead):])
    else:
        p.add_run(text)
    return p


def bullet(doc, text, level=0):
    p = doc.add_paragraph(style="List Bullet" if level == 0 else "List Bullet 2")
    p.paragraph_format.space_after = Pt(3)
    p.add_run(text)
    return p


def heading(doc, text, level=1):
    return doc.add_heading(text, level=level)


def table(doc, headers, rows, widths=None, font_size=9.2):
    tbl = doc.add_table(rows=1, cols=len(headers))
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    for i, header in enumerate(headers):
        cell = tbl.rows[0].cells[i]
        shade(cell, NAVY)
        set_cell_text(cell, header, bold=True, color=WHITE, size=font_size)
        if widths:
            cell.width = Inches(widths[i])
    tr_pr = tbl.rows[0]._tr.get_or_add_trPr()
    repeat = OxmlElement("w:tblHeader")
    repeat.set(qn("w:val"), "true")
    tr_pr.append(repeat)
    for row_idx, row in enumerate(rows):
        cells = tbl.add_row().cells
        for i, value in enumerate(row):
            if row_idx % 2 == 1:
                shade(cells[i], PALE)
            set_cell_text(cells[i], value, size=font_size)
            if widths:
                cells[i].width = Inches(widths[i])
    doc.add_paragraph().paragraph_format.space_after = Pt(1)
    return tbl


def source_list(doc, sources):
    heading(doc, "Sources and pricing references", 1)
    para(doc, "Prices were checked on 11 September 2026. AWS bills in USD and varies by region, usage and future price changes. The model uses the ECB reference rate published on 9 September 2026: EUR 1 = USD 1.1652. Amounts exclude VAT.")
    for label, url in sources:
        p = doc.add_paragraph(style="List Bullet")
        add_hyperlink(p, label, url)


SOURCES = [
    ("Amazon Lightsail pricing", "https://aws.amazon.com/lightsail/pricing/"),
    ("Amazon CloudFront pricing and free usage", "https://aws.amazon.com/cloudfront/pricing/"),
    ("Amazon S3 pricing", "https://aws.amazon.com/s3/pricing/"),
    ("Amazon Cognito pricing", "https://aws.amazon.com/cognito/pricing/"),
    ("Amazon DynamoDB pricing", "https://aws.amazon.com/dynamodb/pricing/"),
    ("AWS Lambda pricing", "https://aws.amazon.com/lambda/pricing/"),
    ("Amazon API Gateway pricing", "https://aws.amazon.com/api-gateway/pricing/"),
    ("Amazon CloudWatch pricing", "https://aws.amazon.com/cloudwatch/pricing/"),
    ("AWS WAF pricing", "https://aws.amazon.com/waf/pricing/"),
    ("Amazon Route 53 pricing", "https://aws.amazon.com/route53/pricing/"),
    ("AWS Elemental MediaConvert pricing", "https://aws.amazon.com/mediaconvert/pricing/"),
    ("ECB euro foreign exchange reference rates", "https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html"),
]


def detailed_report():
    doc = setup_doc("Nebula Tech AWS Deployment and Cost Model", "Technical estimate for a 1000 learner launch")
    para(doc, "Recommendation: launch in an EU AWS region with the existing Docker application on Amazon Lightsail Containers, Amazon S3 and CloudFront for pre-generated media, Cognito for identity, DynamoDB for learner progress, and CloudWatch for basic monitoring. This keeps the initial platform simple, keeps audiovisual delivery off the application server, and can scale service by service.")
    heading(doc, "Decision summary")
    bullet(doc, "Base cloud operating budget: EUR 35 to EUR 45 per month, excluding VAT, domain registration and optional support. The model assumes 1,000 monthly active learners and up to 1 TB of delivered media per month.")
    bullet(doc, "Recommended implementation budget: 160 hours at EUR 25 per hour = EUR 4,000, excluding VAT. This includes productionising the current prototype, migration from Dropbox, deployment, testing and launch documentation.")
    bullet(doc, "Pre-generated audio and video are treated as content assets, not real-time AI services. Their delivery cost is primarily storage and CDN traffic, not TTS or video-generation usage.")
    bullet(doc, "A single-container launch is deliberately low cost and is not highly available. Add a second application node and a relational database only when usage, revenue or contractual uptime requirements justify them.")

    heading(doc, "Scope and working assumptions")
    table(doc, ["Area", "Base assumption used for this estimate"], [
        ["Learners", "1,000 monthly active learners; approximately 12 study sessions per learner each month."],
        ["Traffic", "Up to 750 GB of monthly CDN delivery, including video, audio, images and web assets. Content delivery, rather than API traffic, is the primary uncertainty."],
        ["Content library", "150 GB in S3, including source media, web-ready audio/video, images and versioned backups."],
        ["Application", "Current responsive web app, Dockerised Node service, login, learner progress, lesson catalogue and pre-generated media."],
        ["Data", "Account identifiers and learning progress only. Passwords are handled by Cognito. No payment data, sensitive student records, live video or AI generation are included."],
        ["Region", "EU Ireland as the first cost model. It keeps primary processing in the EU and has broad service availability. Validate the chosen region in AWS Pricing Calculator before purchase."],
        ["Currency", "AWS charges are modelled in USD and converted at EUR 1 = USD 1.1652. Currency, tax and AWS list prices can change."],
    ], widths=[1.35, 5.55])

    heading(doc, "Recommended launch architecture")
    para(doc, "Dropbox remains the source during migration only. A controlled upload process copies approved assets into private and delivery S3 buckets, records file checksums, and applies least-privilege access. CloudFront serves public learning media from S3; the web application and API run in one Lightsail container; Cognito issues user sessions; DynamoDB stores progress and lightweight content metadata; CloudWatch receives application logs and alarms.")
    table(doc, ["Layer", "AWS service", "Purpose", "Why it fits the launch"], [
        ["Web and API", "Lightsail Containers Small", "Runs the existing Docker image and API.", "Predictable EUR-equivalent monthly cost and minimal change from the current container deployment."],
        ["Media", "S3 Standard plus versioning", "Stores audio, video, images and source exports.", "Durable object storage; Dropbox is removed from the runtime path."],
        ["Delivery", "CloudFront", "Caches web assets and media near learners.", "Keeps video off the application server; the first 1 TB monthly delivery and 10M HTTP/S requests are currently free."],
        ["Identity", "Cognito User Pool", "Sign-up, sign-in, password reset and tokens.", "Avoids storing passwords. The direct-sign-in free tier covers 10,000 MAUs, so 1,000 MAUs is modelled at zero."],
        ["Progress database", "DynamoDB on demand", "Learner profile, lesson state, attempts and progress.", "No server to size at this scale; per-request costs remain small for simple progress records."],
        ["Monitoring", "CloudWatch", "Structured logs, budget alert and two health alarms.", "Basic CloudWatch metrics, 5 GB log usage and 10 standard alarms have a free allowance; a small budget remains prudent."],
        ["Security edge", "AWS WAF on CloudFront", "Rate limit sign-in and block common malicious traffic.", "An inexpensive baseline control for a public site. The estimate uses one ACL and two simple rules."],
        ["DNS and TLS", "Route 53 and ACM", "DNS zone and HTTPS certificate.", "Route 53 provides authoritative DNS; public ACM certificates used with CloudFront are free."],
    ], widths=[1.05, 1.55, 2.15, 2.15], font_size=8.6)

    doc.add_page_break()
    heading(doc, "Monthly cloud cost model")
    para(doc, "This is an operating estimate, not an AWS quote. It assumes the described usage, one application node, no paid AWS support plan and no new-account promotional credits. The reserve is intended to absorb small usage variation, not a large change in video viewing.")
    table(doc, ["Service", "Monthly usage assumption", "USD", "EUR approx", "Notes"], [
        ["Lightsail Containers Small", "One 0.5 vCPU, 1 GB node", "$15.00", "EUR 12.87", "Application and API. 500 GB included direct transfer, but media should be served through CloudFront."],
        ["S3 Standard", "150 GB media and backups", "$3.45", "EUR 2.96", "At $0.023 per GB-month for the first 50 TB; requests modelled separately."],
        ["S3 requests and ECR image storage", "300k GET, 10k PUT, small image", "$0.40", "EUR 0.34", "Rounded working allowance."],
        ["CloudFront", "750 GB delivery, under current 1 TB monthly allowance", "$0.00", "EUR 0.00", "Also under the current 10M HTTP/S request allowance."],
        ["Cognito", "1,000 direct-sign-in MAUs", "$0.00", "EUR 0.00", "Current user-pool free tier is 10,000 MAUs. Advanced security is not included."],
        ["DynamoDB on demand", "2M reads, 0.5M writes, 2 GB data", "$1.75", "EUR 1.50", "Small progress records and content metadata; rounded from current per-request pricing."],
        ["CloudWatch", "Basic metrics, modest logs and alarms", "$0.75", "EUR 0.64", "A reserve after the current free allowance."],
        ["AWS WAF", "One ACL, two rules, 300k requests", "$7.18", "EUR 6.16", "$5 ACL + $2 rules + small request charge. No paid managed marketplace rules."],
        ["Route 53", "One hosted zone and modest DNS queries", "$0.55", "EUR 0.47", "Hosted zone is $0.50 per month; queries rounded."],
        ["Backups and versioning", "50 GB retained recovery copies", "$1.15", "EUR 0.99", "S3 versioning and export allowance."],
        ["Domain registration allowance", "One .com or similar, annualised", "$1.40", "EUR 1.20", "Actual TLD pricing varies and is normally paid annually."],
        ["Base total", "Before reserve", "$31.63", "EUR 27.15", "Excludes VAT."],
        ["Operational reserve", "Approximately 30 percent", "$9.49", "EUR 8.15", "For minor traffic, request and log variance."],
        ["Recommended monthly budget", "Base launch", "$41.12", "EUR 35.30", "Round to EUR 35 to EUR 45 per month, excluding VAT."],
    ], widths=[1.35, 2.25, .65, .8, 1.85], font_size=8.0)

    doc.add_page_break()
    heading(doc, "What changes the bill")
    table(doc, ["Scenario", "Main change", "Expected monthly cloud budget", "Interpretation"], [
        ["Base launch", "Up to 1 TB media delivery; 150 GB stored", "EUR 35 to EUR 45", "Appropriate for 1,000 regular learners with controlled video lengths."],
        ["Growing usage", "About 1.5 TB media delivery", "EUR 70 to EUR 85", "Roughly 0.5 TB exceeds CloudFront's current free allowance; use EUR 0.073 per extra GB as a planning rate before region-specific confirmation."],
        ["Video-heavy usage", "About 3 TB media delivery", "EUR 180 to EUR 220", "Video delivery becomes the dominant line item. Optimise formats, bitrate and caching first."],
        ["Higher availability", "Two app nodes, backups and managed relational database", "Add EUR 55 to EUR 110", "A resilience upgrade; not needed for the first low-risk launch, but required for stricter uptime commitments."],
    ], widths=[1.2, 2.3, 1.35, 2.05], font_size=8.5)
    para(doc, "Avoid serving video directly from the application container. Use CloudFront with cache-control headers, adaptive video only when it demonstrably improves learning, and track monthly delivery in AWS Budgets. AWS should be configured with a monthly budget alert at EUR 35, EUR 50 and EUR 100 equivalents.")

    heading(doc, "Audio video and Dropbox migration")
    bullet(doc, "Existing audio and video are a one-time migration, not an ongoing TTS or generation cost. The platform should store the approved final versions and metadata only.")
    bullet(doc, "Inventory Dropbox files, retain owner and licence evidence, normalise filenames, calculate a checksum, upload to S3, verify object count and checksum, then restrict direct Dropbox access. Keep the original source only if it is required for re-editing.")
    bullet(doc, "Use local FFmpeg for a small, curated catalogue to avoid AWS encoding charges. If managed encoding is preferred, MediaConvert bills per output minute and resolution. Every additional 100 GB of S3 Standard storage is approximately USD 2.30, or EUR 1.97, before requests and VAT.")

    heading(doc, "Privacy security and operating boundaries")
    bullet(doc, "Use Cognito for credentials and password recovery. Store only a Cognito user ID, display name if needed, consent status and learning progress in the application database.")
    bullet(doc, "Use separate development and production AWS accounts or at minimum separate environments, MFA for administrators, least-privilege IAM roles, encrypted S3 and DynamoDB, private S3 buckets behind CloudFront, dependency updates and a named backup restore test.")
    bullet(doc, "Use an EU region and document the controller, processor, retention periods and lawful basis before collecting learner information. This report is technical planning, not legal advice or a GDPR compliance opinion.")
    bullet(doc, "Do not include payment-card data in this stack. If subscriptions are introduced, use a payment provider's hosted checkout and keep card data outside Nebula Tech systems.")

    heading(doc, "Implementation effort and price")
    para(doc, "The estimate assumes one developer working with Codex and cloud tooling, the existing prototype as a starting point, approved lesson content, and no custom video production. AI-assisted development reduces implementation, scaffolding, test and documentation time, but does not remove the need for educational review, security decisions, mobile testing, account setup and launch validation.")
    table(doc, ["Work package", "Hours", "Cost at EUR 25 per hour", "Deliverable"], [
        ["Requirements and data model", "8", "EUR 200", "Production scope, learner records, privacy-minimised schema and acceptance criteria."],
        ["Dropbox inventory and content import", "14", "EUR 350", "Asset inventory, S3 structure, upload/verification workflow and selected media import."],
        ["Authentication and learner progress", "24", "EUR 600", "Cognito integration, user records, progress persistence and secure API boundaries."],
        ["Learning experience and content delivery", "30", "EUR 750", "Production-ready A1-A2 flows, responsive UI, lesson data, media playback and error states."],
        ["Backend API and database integration", "16", "EUR 400", "Content, progress and grading endpoints; validation and audit-ready data shape."],
        ["AWS deployment and monitoring", "22", "EUR 550", "Infrastructure, Docker release path, DNS, CDN, WAF baseline, logs, budget alerts and backups."],
        ["Testing accessibility and launch validation", "20", "EUR 500", "Automated checks, mobile/browser test pass, basic accessibility review and production smoke test."],
        ["Documentation handover and coordination", "10", "EUR 250", "Runbook, credentials handover process, architecture notes and client launch handover."],
        ["Delivery contingency", "16", "EUR 400", "Small scope clarification, integration fixes and final revisions."],
        ["Recommended launch total", "160", "EUR 4,000", "Excludes VAT, third-party licences, new media production, legal review and paid support."],
    ], widths=[2.2, .55, 1.25, 3.0], font_size=8.2)
    para(doc, "Optional ongoing platform care: reserve 3 to 5 hours per month, or EUR 75 to EUR 125 per month, for dependency updates, cost review, small content changes, backups and incident triage. This is separate from AWS charges. A formal uptime SLA, weekend cover or significant new features require a separate agreement.")

    heading(doc, "Delivery sequence")
    table(doc, ["Stage", "Outcome", "Indicative effort"], [
        ["1. Confirm scope", "Define data fields, content inventory, domain ownership and launch acceptance criteria.", "8 hours"],
        ["2. Build production foundations", "Identity, progress, API, data migration and media access controls.", "54 hours"],
        ["3. Deploy and harden", "AWS environment, CDN, WAF, monitoring, backups, release workflow and cost alerts.", "38 hours"],
        ["4. Validate and launch", "Content QA, mobile/browser test pass, accessibility basics, handover and controlled release.", "44 hours plus 16-hour contingency"],
    ], widths=[1.25, 4.2, 1.55])

    heading(doc, "Exclusions and approval points")
    bullet(doc, "Not included: production of new videos, professional voice recording, bespoke illustration, translation, legal/privacy counsel, payment subscriptions, live teaching video, native apps, school SSO, a full CMS, marketing, or a customer support desk.")
    bullet(doc, "Before committing spend: confirm the AWS region, domain, exact media volume, average viewing minutes, storage retention, whether a managed database is needed, and whether the client requires high availability or a formal SLA.")
    bullet(doc, "Re-run the estimate in AWS Pricing Calculator with the final region and measured beta usage. AWS list pricing, free allowances, exchange rates and taxes may change.")
    source_list(doc, SOURCES)
    doc.save(OUT / "Nebula_Tech_Technical_AWS_Cost_Model.docx")


def client_estimate():
    doc = setup_doc("Nebula Tech Client Cost Estimate", "Indicative launch cost for a 1000 learner web application")
    para(doc, "This estimate covers a lean AWS launch for an English-learning platform with pre-generated audio and video, learner accounts, progress tracking and basic monitoring. It is designed for approximately 1,000 monthly active learners and is intentionally simple at launch.")
    heading(doc, "Recommended budget")
    table(doc, ["Item", "Estimate", "What it covers"], [
        ["Initial development", "EUR 4,000", "160 hours at EUR 25 per hour. Productionising the existing prototype, Dropbox media migration, secure learner accounts, progress database, AWS deployment, monitoring, tests and handover."],
        ["Cloud platform", "EUR 35 to EUR 45 per month", "AWS hosting, media storage and delivery, login service, learner progress database, monitoring, security baseline and DNS. Excludes VAT."],
        ["Optional platform care", "EUR 75 to EUR 125 per month", "3 to 5 developer hours for updates, cost checks, small fixes, backups and incident triage."],
        ["First year without optional care", "EUR 4,420 to EUR 4,540", "Initial development plus 12 months of estimated cloud cost."],
        ["First year with optional care", "EUR 5,320 to EUR 6,040", "Initial development, cloud cost and 12 months of light platform care."],
    ], widths=[1.6, 1.35, 4.05], font_size=9.0)

    heading(doc, "What the launch includes")
    bullet(doc, "A responsive web application for desktop and mobile browsers.")
    bullet(doc, "Learner sign-up and secure sign-in. Passwords are not stored by Nebula Tech.")
    bullet(doc, "A1 and A2 learning activities, saved progress and pre-generated audio/video assets.")
    bullet(doc, "Migration of approved media from Dropbox into managed cloud storage.")
    bullet(doc, "HTTPS, content delivery network, basic login rate limiting, backups, logs, health monitoring and a monthly cloud budget alert.")
    bullet(doc, "Technical handover documentation and a repeatable release process.")

    heading(doc, "How the monthly cloud cost is kept low")
    bullet(doc, "Video and audio are delivered from a content delivery network rather than from the application server.")
    bullet(doc, "The platform uses pre-generated media. There is no recurring AI voice or video-generation charge in this estimate.")
    bullet(doc, "The first 1 TB of Amazon CloudFront delivery is currently included each month. The estimate assumes usage remains within that allowance.")
    bullet(doc, "The learner login service covers up to 10,000 monthly active direct-sign-in users in its current free allowance. The estimate assumes 1,000 learners.")

    heading(doc, "What could increase the cost")
    table(doc, ["Change", "Likely effect"], [
        ["More than 1 TB of video and media delivery each month", "Allow approximately EUR 70 to EUR 85 per month at around 1.5 TB, or EUR 180 to EUR 220 at around 3 TB. Video viewing is the main cost driver."],
        ["High availability or contractual uptime commitment", "Add approximately EUR 55 to EUR 110 per month for redundant application capacity, database resilience and enhanced recovery."],
        ["New content creation", "Not included. Existing media can be migrated; new video, professional recording, translation or illustration should be scoped separately."],
        ["Payment subscriptions, live classes or school systems", "Require a separate feature estimate and may introduce third-party charges."],
    ], widths=[3.3, 3.7], font_size=9.0)

    heading(doc, "Delivery approach")
    bullet(doc, "Confirm the lesson content, approved Dropbox media, domain and learner data fields.")
    bullet(doc, "Set up the cloud environment, database, login and media delivery.")
    bullet(doc, "Migrate and check the media library, then test the platform on mobile and desktop.")
    bullet(doc, "Launch with a spending alert, monitoring and documented handover.")

    heading(doc, "Important assumptions")
    bullet(doc, "Prices are indicative, checked in September 2026 and exclude VAT. AWS prices, taxes, exchange rates and usage can change.")
    bullet(doc, "The estimate assumes 1,000 active learners per month, up to 750 GB of monthly media delivery, 150 GB stored content, and an EU AWS region.")
    bullet(doc, "This is a web application estimate. Native mobile applications, payments, live video, advanced analytics and full multilingual expansion are not included.")
    para(doc, "The detailed technical calculation, service list, assumptions and source links are available in the companion technical report.")
    doc.save(OUT / "Nebula_Tech_Client_Cost_Estimate.docx")


def future_opportunities():
    doc = setup_doc("Nebula Tech Growth Paths and Business Opportunities", "Ways to extend a teacher led language learning platform")
    para(doc, "Nebula Tech can begin as a focused English practice platform and develop into a teacher-led product that connects self-study, structured lessons and real teaching. The strongest route is to validate one learner group and one paid offer before expanding languages or adding complex platform features.")
    heading(doc, "Near term product opportunities")
    table(doc, ["Opportunity", "Learner value", "Commercial model", "First practical version"], [
        ["Level pathway A1 to B2", "A clear next step after each lesson and visible progress.", "Subscription or course pack.", "Add level maps, placement test and 8 to 12 focused lesson units per level."],
        ["Teacher reinforcement space", "Practice between live classes and targeted homework.", "Included in private teaching packages.", "Create groups, assign lessons, view completion and send feedback."],
        ["English exam and skill tracks", "Practice for grammar, listening, speaking and vocabulary goals.", "Premium packs or short intensive programmes.", "Start with one use case, such as A2 to B1 progression or workplace English."],
        ["School and academy licence", "A shared practice environment for a cohort.", "Per learner or annual cohort licence.", "Teacher dashboard, CSV enrolment, class reports and basic admin roles."],
        ["Additional languages", "A reusable format for Spanish, German, French or other language combinations.", "Separate catalogue or bundle upgrade.", "Treat each language pair as a content product with its own teaching and audio review."],
    ], widths=[1.55, 2.1, 1.5, 1.95], font_size=8.6)

    heading(doc, "A sensible growth sequence")
    heading(doc, "Stage 1 Validate the teaching proposition", 2)
    bullet(doc, "Launch English A1 and A2 with a small number of real learners from existing teaching activity.")
    bullet(doc, "Measure completed lessons, repeat sessions, common mistakes, audio use and learner feedback before expanding the catalogue.")
    bullet(doc, "Offer the platform as a reinforcement component of private classes, rather than selling a broad self-study product immediately.")

    heading(doc, "Stage 2 Create a repeatable paid offer", 2)
    bullet(doc, "Package a clear outcome: for example, an A2 confidence programme, a B1 transition course, or English practice between weekly classes.")
    bullet(doc, "Test a simple model: a course fee, a monthly membership, or tuition plus platform access. Keep payment handling with a hosted provider rather than storing card data.")
    bullet(doc, "Create a lightweight teacher view for assignments and completion. This is the bridge between teaching expertise and a scalable product.")

    heading(doc, "Stage 3 Serve cohorts and organisations", 2)
    bullet(doc, "Add class groups, invitations, role-based access, attendance-linked assignments and exportable progress summaries.")
    bullet(doc, "Approach academies, small schools and employers with a teacher-supported pilot instead of an unassisted software sale.")
    bullet(doc, "Use the content library once across several cohorts; this is where the original production effort becomes more valuable." )

    heading(doc, "Stage 4 Expand languages and formats", 2)
    bullet(doc, "Add B1 and B2 only after A1-A2 usage demonstrates that learners complete content and return regularly.")
    bullet(doc, "Localise the learning path, examples and audio quality for each new language pair. Direct translation alone is not enough for grammar teaching.")
    bullet(doc, "Consider speaking practice, teacher-reviewed writing, lesson booking and certificates after the foundations are stable.")

    heading(doc, "Potential revenue models to test")
    table(doc, ["Model", "Best for", "What to test first", "Operational caution"], [
        ["Freemium practice", "Audience building and lead generation.", "A small free A1 module with a clear paid next step.", "Free media delivery can rise quickly if video is unrestricted."],
        ["Subscription", "Regular independent learners.", "One monthly plan with full access to a defined level path.", "Retention and fresh content matter more than initial sign-ups."],
        ["Tutoring bundle", "Teacher-led learners.", "Class package plus platform access and homework.", "Strong fit with an individual teacher; keep administrative work light."],
        ["Academy licence", "Small cohorts and organisations.", "A paid pilot for one class and one term.", "Needs roles, reporting, invoicing and account administration."],
        ["Premium assessment", "Learners seeking proof of progress.", "Teacher feedback or an end-of-unit assessment.", "Do not represent internal completion as an official certification without accreditation."],
    ], widths=[1.35, 1.55, 2.3, 1.9], font_size=8.5)

    heading(doc, "What to measure before scaling")
    bullet(doc, "Activation: percentage of registered learners completing their first lesson within seven days.")
    bullet(doc, "Learning engagement: lessons completed per active learner, audio plays, return sessions and time spent on a level.")
    bullet(doc, "Learning quality: error patterns by activity type, learner confidence survey and teacher observation.")
    bullet(doc, "Commercial signal: conversion from teaching lead to paying learner, renewal rate and revenue per active learner.")
    bullet(doc, "Cost control: media delivery per active learner, storage growth, support time and content production time.")

    heading(doc, "Investment principles")
    bullet(doc, "Prioritise reusable lesson formats and a reliable content workflow before building many bespoke features.")
    bullet(doc, "Keep learner data minimal and use it to improve teaching, not to create unnecessary surveillance or opaque scoring.")
    bullet(doc, "Use real learner feedback to decide which language level, skill or market segment deserves the next investment.")
    bullet(doc, "Treat professional video, voice recording and specialist content as editorial investments with a clear reuse plan across courses and cohorts.")
    para(doc, "The recommended first commercial test is a teacher-led English A1-A2 practice bundle. It uses the existing differentiator - teaching expertise - while the platform proves its value between lessons. Expansion to B1-B2, more languages and organisation licences should follow measured demand.")
    doc.save(OUT / "Nebula_Tech_Growth_Paths_and_Business_Opportunities.docx")


if __name__ == "__main__":
    detailed_report()
    client_estimate()
    future_opportunities()
    print("Created three documents in", OUT)
