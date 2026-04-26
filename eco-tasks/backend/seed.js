const db = require('./db');
const bcrypt = require('bcryptjs');

const TASK_IDS = ['t1','t2','t3','t4','t5','t6','t7','t8','t9','t10','t11','t12','t13','t14','t15'];
const TASKS_PER_DAY = 5;

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return h;
}

function getDailyTaskIds(dateStr) {
  const seed = dateStr.split('-').reduce((acc, v) => acc + parseInt(v), 0);
  return [...TASK_IDS]
    .sort((a, b) => hashCode(a + seed) - hashCode(b + seed))
    .slice(0, TASKS_PER_DAY);
}

function dateMinusDays(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// Realistic-looking fake users — mix of streaks, not all round numbers
const SEED_USERS = [
  { username: 'Aysel_H',    email: 'aysel.h@eco.az',      streak: 47 },
  { username: 'RaufElcin',  email: 'rauf.e@eco.az',       streak: 38 },
  { username: 'Gunay_S',    email: 'gunay.s@eco.az',      streak: 35 },
  { username: 'Nermin93',   email: 'nermin93@eco.az',      streak: 29 },
  { username: 'XadijaM',    email: 'xadija.m@eco.az',     streak: 26 },
  { username: 'TuralH',     email: 'tural.huseyn@eco.az', streak: 23 },
  { username: 'Mira_K',     email: 'mira.k@eco.az',       streak: 21 },
  { username: 'gunel_m',    email: 'gunel.m@eco.az',      streak: 19 },
  { username: 'Ali_B88',    email: 'ali.b88@eco.az',      streak: 17 },
  { username: 'Parviz_O',   email: 'parviz.o@eco.az',     streak: 16 },
  { username: 'Leyla_I',    email: 'leyla.i@eco.az',      streak: 14 },
  { username: 'Tohid_V',    email: 'tohid.v@eco.az',      streak: 13 },
  { username: 'kamranr',    email: 'kamran.r@eco.az',     streak: 12 },
  { username: 'Sevinc_M',   email: 'sevinc.m@eco.az',     streak: 11 },
  { username: 'Rashad_G',   email: 'rashad.g@eco.az',     streak: 10 },
  { username: 'Murad_A',    email: 'murad.a@eco.az',      streak: 9  },
  { username: 'Elvin_N',    email: 'elvin.n@eco.az',      streak: 8  },
  { username: 'ayten_c',    email: 'ayten.c@eco.az',      streak: 7  },
  { username: 'Nicat_S',    email: 'nicat.s@eco.az',      streak: 6  },
  { username: 'Seljan_A',   email: 'seljan.a@eco.az',     streak: 6  },
  { username: 'FEridaE',    email: 'ferida.e@eco.az',     streak: 5  },
  { username: 'Ilgar_T',    email: 'ilgar.t@eco.az',      streak: 5  },
  { username: 'OrxanN',     email: 'orxan.n@eco.az',      streak: 4  },
  { username: 'Sabina_K',   email: 'sabina.k@eco.az',     streak: 3  },
  { username: 'Vugar77',    email: 'vugar77@eco.az',       streak: 3  },
  { username: 'Konul_B',    email: 'konul.b@eco.az',      streak: 3  },
  { username: 'ZeynebA',    email: 'zeyneb.a@eco.az',     streak: 2  },
  { username: 'Elnur_F',    email: 'elnur.f@eco.az',      streak: 2  },
  { username: 'Seymur_A',   email: 'seymur.a@eco.az',     streak: 2  },
  { username: 'Shams_D',    email: 'shams.d@eco.az',      streak: 1  },
  { username: 'NarminT',    email: 'narmin.t@eco.az',     streak: 1  },
  { username: 'Jalal_M',    email: 'jalal.m@eco.az',      streak: 1  },
  { username: 'Cavid_R',    email: 'cavid.r@eco.az',      streak: 0  },
  { username: 'Laman_B',    email: 'laman.b@eco.az',      streak: 0  },
  { username: 'Turkan_O',   email: 'turkan.o@eco.az',     streak: 0  },
];

const hash = bcrypt.hashSync('seed1234', 10);
const insertUser = db.prepare(
  'INSERT OR IGNORE INTO users (username, email, password_hash) VALUES (?, ?, ?)'
);
const insertTask = db.prepare(`
  INSERT OR IGNORE INTO task_completions (user_id, task_id, date, completed_at)
  VALUES (?, ?, ?, ?)
`);

const getUserId = db.prepare('SELECT id FROM users WHERE email = ?');

let created = 0;
const seedAll = db.transaction(() => {
  for (const u of SEED_USERS) {
    const result = insertUser.run(u.username, u.email, hash);
    const row = getUserId.get(u.email);
    if (!row) continue;
    const userId = row.id;

    if (result.changes === 0) continue; // already seeded

    created++;
    for (let i = 0; i < u.streak; i++) {
      const date = dateMinusDays(i);
      const tasks = getDailyTaskIds(date);
      for (const taskId of tasks) {
        insertTask.run(userId, taskId, date, `${date}T09:00:00.000Z`);
      }
    }
  }
});
seedAll();

console.log(`Seed tamamlandı. ${created} yeni istifadəçi yaradıldı.`);
