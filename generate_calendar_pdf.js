const PDFDocument = require('pdfkit');
const fs = require('fs');

const NAVY  = '#0A2218';
const TEAL  = '#2A7A6F';
const RUST  = '#B7603B';
const RULE  = '#D8D8D0';
const INK3  = '#8A8A82';
const INK   = '#22221E';
const MUTED = '#A8C4BC';

const CAT_COLOR = {
  'Core In-Person Event':           NAVY,
  'Virtual Business Event':         TEAL,
  'Optional Connection Experience': RUST,
};

const EVENTS = [
  { move:'01', title:'Before the First Serve',                         sub:'The Journey Begins at the US Open',       date:'August 27, 2026',    loc:'New York, NY',    chair:'Raghav Sapra',             cat:'Core In-Person Event' },
  { move:'02', title:'Cranberries, Chocolate, and Wellness',           sub:'',                                        date:'October 3, 2026',    loc:'Chatsworth, NJ',  chair:'William Tenenbaum',        cat:'Optional Connection Experience' },
  { move:'03', title:'Inside the FBI',                                 sub:'Leadership Under Pressure',               date:'October 13, 2026',   loc:'Washington, DC',  chair:'Mark Stephenson',          cat:'Core In-Person Event' },
  { move:'04', title:'Generational Wealth',                            sub:'Designing the System Before It Is Needed',date:'November 12, 2026',  loc:'Virtual',         chair:'William Tenenbaum',        cat:'Virtual Business Event' },
  { move:'05', title:'Atlantic 13 Holiday Party Meets Broadway',       sub:'',                                        date:'December 1, 2026',   loc:'New York, NY',    chair:'Jacquelyn Lane',           cat:'Core In-Person Event' },
  { move:'06', title:'Scaling Without Breaking in the Age of AI',      sub:'',                                        date:'January 2027',       loc:'Virtual',         chair:'MichaelAaron Flicker',     cat:'Virtual Business Event' },
  { move:'07', title:'Caribbean Escape',                               sub:'St. Barths',                              date:'January 2027',       loc:'St. Barths',      chair:'Brooke Neblett',           cat:'Optional Connection Experience' },
  { move:'08', title:'Pushing the Limits at Harvard Business School',  sub:'',                                        date:'February 2027',      loc:'Boston, MA',      chair:'Max Winthrop & Tara Fung', cat:'Core In-Person Event' },
  { move:'09', title:"The CEO's Highest-Leverage Decisions",           sub:'',                                        date:'March 2027',         loc:'Virtual',         chair:'Asif Zaman',               cat:'Virtual Business Event' },
  { move:'10', title:'Turning Strategy into Execution',                sub:'Through Management Systems',              date:'April 2027',         loc:'Virtual',         chair:'Andrew Halliday',          cat:'Virtual Business Event' },
  { move:'11', title:'Alignment, Legacy, and the Life We Are Building',sub:'',                                        date:'April 9–11, 2027',loc:'Aspen, CO',    chair:'Glen Kunofsky',            cat:'Optional Connection Experience' },
  { move:'12', title:'The Final Move',                                 sub:'Atlantic 13 in Spain',                    date:'May 12–16, 2027',loc:'Valencia, Spain', chair:'Richard Resnick',          cat:'Core In-Person Event' },
  { move:'13', title:'AI Show & Tell',                                 sub:'What Leaders Are Actually Using',         date:'June 2027',          loc:'Virtual',         chair:'Tara Fung',                cat:'Virtual Business Event' },
];

const PW = 8.5 * 72;   // 612
const PH = 11  * 72;   // 792
const MX = 0.55 * 72;  // side margin
const MT = 0.5  * 72;  // top margin
const MB = 0.45 * 72;  // bottom margin

const doc = new PDFDocument({ size: 'LETTER', margin: 0, info: { Title: 'YPO Atlantic 13 · FY 2026-2027 Calendar' } });
const out = fs.createWriteStream('A13_Calendar_2026-2027.pdf');
doc.pipe(out);

// ── Header bar ──────────────────────────────────────────────
const HDR_H = 0.72 * 72;
doc.rect(0, 0, PW, HDR_H).fill(NAVY);

doc.fillColor('white').font('Helvetica-Bold').fontSize(15)
   .text('YPO Atlantic 13', MX, 14, { lineBreak: false });
doc.fillColor(MUTED).font('Helvetica').fontSize(8.5)
   .text('FY 2026–2027 Learning Year Calendar', MX, 30, { lineBreak: false });
doc.fillColor('#7AA898').font('Helvetica').fontSize(7.5)
   .text('Members Only · Confidential', 0, 22, { align: 'right', width: PW - MX, lineBreak: false });

// ── Legend ──────────────────────────────────────────────────
const LEG_Y = HDR_H + 10;
const legend = [
  ['Core In-Person Event', NAVY],
  ['Virtual Business Event', TEAL],
  ['Optional Connection Experience', RUST],
];
let lx = MX;
legend.forEach(([lbl, col]) => {
  doc.circle(lx + 4, LEG_Y + 4.5, 4).fill(col);
  doc.fillColor('#444440').font('Helvetica').fontSize(6.5)
     .text(lbl, lx + 12, LEG_Y, { lineBreak: false });
  lx += doc.widthOfString(lbl) + 24;
});

// thin rule
const RULE_Y = LEG_Y + 17;
doc.moveTo(MX, RULE_Y).lineTo(PW - MX, RULE_Y).lineWidth(0.5).stroke(RULE);

// ── Event cards (2-column grid) ──────────────────────────────
const GRID_TOP   = RULE_Y + 8;
const GRID_BOT   = MB + 14;
const GRID_H     = GRID_TOP - GRID_BOT;  // available height from top downward (we'll flip y)
const COL_W      = (PW - 2 * MX) / 2;
const N          = EVENTS.length;
const ROWS       = Math.ceil(N / 2);
const CARD_H     = GRID_H / ROWS;
const PAD        = 7;
const STRIP_W    = 3;

EVENTS.forEach((ev, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const cx  = MX + col * COL_W;
  const cy  = GRID_TOP + row * CARD_H;   // top of card (y increases downward)

  const accent = CAT_COLOR[ev.cat] || NAVY;

  // left accent strip
  doc.rect(cx, cy + PAD * 0.5, STRIP_W, CARD_H - PAD).fill(accent);

  const tx = cx + STRIP_W + 7;  // text x

  // move label
  doc.fillColor(accent).font('Helvetica-Bold').fontSize(6)
     .text(`EVENT ${ev.move}`, tx, cy + PAD + 1, { lineBreak: false });

  // title (auto-wrap within column)
  const titleMaxW = COL_W - STRIP_W - 18;
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(8.5);
  const titleLines = wrapText(doc, ev.title, 'Helvetica-Bold', 8.5, titleMaxW);
  let ty = cy + PAD + 11;
  titleLines.forEach(line => {
    doc.text(line, tx, ty, { lineBreak: false });
    ty += 10;
  });

  // subtitle
  if (ev.sub) {
    doc.fillColor(INK3).font('Helvetica-Oblique').fontSize(7)
       .text(ev.sub, tx, ty, { lineBreak: false });
    ty += 9;
  }

  // date
  ty += 1;
  doc.fillColor(INK).font('Helvetica').fontSize(7)
     .text(ev.date, tx, ty, { lineBreak: false });
  ty += 8.5;

  // loc · chair
  doc.fillColor(INK3).font('Helvetica').fontSize(6.8)
     .text(`${ev.loc}  ·  Chair: ${ev.chair}`, tx, ty, { lineBreak: false, width: titleMaxW });

  // separator lines
  doc.lineWidth(0.4).strokeColor(RULE);
  const sepY = cy + CARD_H;
  if (col === 1 || i === N - 1) {
    doc.moveTo(MX, sepY).lineTo(PW - MX, sepY).stroke();
  }
  // vertical divider
  if (col === 0) {
    doc.moveTo(MX + COL_W, cy + PAD * 0.3).lineTo(MX + COL_W, sepY - PAD * 0.3).stroke();
  }
});

// ── Footer ───────────────────────────────────────────────────
doc.fillColor(INK3).font('Helvetica').fontSize(6.5)
   .text('YPO Atlantic 13  ·  FY 2026–2027  ·  For Members Only', 0, PH - MB + 2, { align: 'center', width: PW });

doc.end();
out.on('finish', () => console.log('PDF saved: A13_Calendar_2026-2027.pdf'));

// simple word-wrap helper
function wrapText(doc, text, font, size, maxW) {
  doc.font(font).fontSize(size);
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (doc.widthOfString(test) <= maxW) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}
