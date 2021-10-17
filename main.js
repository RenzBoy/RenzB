const {
  WAConnection: _WAConnection,
  MessageType,
  Presence,
  Mimetype,
  GroupSettingChange,
} = require("@adiwajshing/baileys");
const simple = require("./lib/simple.js");
const WAConnection = simple.WAConnection(_WAConnection);
const fs = require("fs");
const { banner, start, success, getGroupAdmins } = require("./lib/functions");
const { color } = require("./lib/color");
const fetch = require("node-fetch");
const moment = require("moment-timezone");

blocked = [];

require("./index.js");
nocache("./index.js", (module) => console.log(`${module} is now updated!`));

const starts = async (denz = new WAConnection()) => {
  denz.logger.level = "warn";
  denz.version = [2, 2123, 8];
  denz.browserDescription = ["hehe boy", "Chrome", "3.0"];
  console.log(banner.string);
  denz.on("qr", () => {
    console.log(
      color("[", "white"),
      color("!", "blue"),
      color("]", "white"),
      color(" Scan bang")
    );
  });

  fs.existsSync("./session.json") && denz.loadAuthInfo("./session.json");
  denz.on("connecting", () => {
    start("2", "Connecting...");
  });
  denz.on("open", () => {
    success("2", "Connected");
  });
  await denz.connect({ timeoutMs: 30 * 1000 });
  fs.writeFileSync(
    "./session.json",
    JSON.stringify(denz.base64EncodedAuthInfo(), null, "\t")
  );

  denz.on("group-update", async (anu) => {
    metdata = await denz.groupMetadata(anu.jid);
    if (anu.announce == "false") {
      teks = `- [ Group Opened ] -\n\n_Group telah dibuka oleh admin_\n_Sekarang semua member bisa mengirim pesan_`;
      denz.sendMessage(metdata.id, teks, MessageType.text);
      console.log(`- [ Group Opened ] - In ${metdata.subject}`);
    } else if (anu.announce == "true") {
      teks = `- [ Group Closed ] -\n\n_Group telah ditutup oleh admin_\n_Sekarang hanya admin yang dapat mengirim pesan_`;
      denz.sendMessage(metdata.id, teks, MessageType.text);
      console.log(`- [ Group Closed ] - In ${metdata.subject}`);
    } else if (!anu.desc == "") {
      tag = anu.descOwner.split("@")[0] + "@s.whatsapp.net";
      teks = `- [ Group Description Change ] -\n\nDeskripsi Group telah diubah oleh Admin @${
        anu.descOwner.split("@")[0]
      }\n� Deskripsi Baru : ${anu.desc}`;
      denz.sendMessage(metdata.id, teks, MessageType.text, {
        contextInfo: { mentionedJid: [tag] },
      });
      console.log(`- [ Group Description Change ] - In ${metdata.subject}`);
    } else if (anu.restrict == "false") {
      teks = `- [ Group Setting Change ] -\n\nEdit Group info telah dibuka untuk member\nSekarang semua member dapat mengedit info Group Ini`;
      denz.sendMessage(metdata.id, teks, MessageType.text);
      console.log(`- [ Group Setting Change ] - In ${metdata.subject}`);
    } else if (anu.restrict == "true") {
      teks = `- [ Group Setting Change ] -\n\nEdit Group info telah ditutup untuk member\nSekarang hanya admin group yang dapat mengedit info Group Ini`;
      denz.sendMessage(metdata.id, teks, MessageType.text);
      console.log(`- [ Group Setting Change ] - In ${metdata.subject}`);
    }
  });
  denz.on("group-participants-update", async (anu) => {
    try {
      groupMet = await denz.groupMetadata(anu.jid);
      groupMembers = groupMet.participants;
      groupAdmins = getGroupAdmins(groupMembers);
      mem = anu.participants[0];

      console.log(anu);
      try {
        pp_user = await denz.getProfilePicture(mem);
      } catch (e) {
        pp_user =
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60";
      }
      try {
        pp_grup = await denz.getProfilePicture(anu.jid);
      } catch (e) {
        pp_grup =
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60";
      }
      if (anu.action == "add" && mem.includes(denz.user.jid)) {
        denz.sendMessage(anu.jid, "Halo!", "conversation");
      }
      if (anu.action == "add" && !mem.includes(denz.user.jid)) {
        mdata = await denz.groupMetadata(anu.jid);
        memeg = mdata.participants.length;
        num = anu.participants[0];
        let v = denz.contacts[num] || { notify: num.replace(/@.+/, "") };
        anu_user = v.vname || v.notify || num.split("@")[0];
        time_wel = moment.tz("Asia/Jakarta").format("HH:mm");
        teks = `Halo ${anu_user} \n\nNama : \nUmur :\nGender : \nAsal :\n\nSemoga Betah dan jangan lupa isi\nAnd Following Rules Group`;
        buff = await getBuffer(
          `http://hadi-api.herokuapp.com/api/card/welcome?nama=${anu_user}&descriminator=${
            groupMembers.length
          }&memcount=${memeg}&gcname=${encodeURI(
            mdata.subject
          )}&pp=${pp_user}&bg=https://i.postimg.cc/rFkw8MpX/IMG-20210807-151325.jpg`
        );
        buttons = [
          { buttonId: `y`, buttonText: { displayText: "Salam Kenal Ya" }, type: 1 },
          { buttonId: `p`, buttonText: { displayText: "Orang Mana?" }, type: 1 },
          { buttonId: `lu`, buttonText: { displayText: "Cewe Apa Cowo?" }, type: 1 },
        ];
        imageMsg = (
          await denz.prepareMessageMedia(buff, "imageMessage", {
            thumbnail: buff,
          })
        ).imageMessage;
        buttonsMessage = {
          contentText: `${teks}`,
          footerText: "Semoga betah ☕",
          imageMessage: imageMsg,
          buttons: buttons,
          headerType: 4,
        };
        prep = await denz.prepareMessageFromContent(
          mdata.id,
          { buttonsMessage },
          {}
        );
        denz.relayWAMessage(prep);
      }
      if (anu.action == "remove" && !mem.includes(denz.user.jid)) {
        mdata = await denz.groupMetadata(anu.jid);
        num = anu.participants[0];
        let w = denz.contacts[num] || { notify: num.replace(/@.+/, "") };
        anu_user = w.vname || w.notify || num.split("@")[0];
        time_wel = moment.tz("Asia/Jakarta").format("HH:mm");
        memeg = mdata.participants.length;
        out = `Kenapa tuh? kok bisa keluar? \nSayonara ${anu_user} we will miss you`;
        buff = await getBuffer(
          `http://hadi-api.herokuapp.com/api/card/goodbye?nama=${anu_user}&descriminator=${
            groupMembers.length
          }&memcount=${memeg}&gcname=${encodeURI(
            mdata.subject
          )}&pp=${pp_user}&bg=https://i.postimg.cc/rFkw8MpX/IMG-20210807-151325.jpg`
        );
        buttons = [
          { buttonId: `y`, buttonText: { displayText: "Bye-Bye👋" }, type: 1 },
        ];
        imageMsg = (
          await denz.prepareMessageMedia(buff, "imageMessage", {
            thumbnail: buff,
          })
        ).imageMessage;
        buttonsMessage = {
          contentText: `${out}`,
          footerText: "Nitip gorengan ya",
          imageMessage: imageMsg,
          buttons: buttons,
          headerType: 4,
        };
        prep = await denz.prepareMessageFromContent(
          mdata.id,
          { buttonsMessage },
          {}
        );
        denz.relayWAMessage(prep);
      }
      if (anu.action == "promote") {
        const mdata = await denz.groupMetadata(anu.jid);
        num = anu.participants[0];
        let w = denz.contacts[num] || { notify: num.replace(/@.+/, "") };
        anu_user = w.vname || w.notify || num.split("@")[0];
        try {
          ppimg = await denz.getProfilePicture(
            `${anu.participants[0].split("@")[0]}@c.us`
          );
        } catch {
          ppimg =
            "https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg";
        }
        let buffer = await getBuffer(
          `https://api-yogipw.herokuapp.com/api/promote?name=${anu_user}&msg=selamat%20menjadi%20admin&mem=${groupAdmins.length}&picurl=${ppimg}&bgurl=https://cdn.discordapp.com/attachments/819995259261288475/835055559941292032/style.jpg`
        );
        teks = `${anu_user} Telah dipromote`;
        denz.sendMessage(mdata.id, buffer, MessageType.image, {
          caption: teks,
        });
      }

      if (anu.action == "demote") {
        const mdata = await denz.groupMetadata(anu.jid);
        num = anu.participants[0];
        let w = denz.contacts[num] || { notify: num.replace(/@.+/, "") };
        anu_user = w.vname || w.notify || num.split("@")[0];
        try {
          ppimg = await denz.getProfilePicture(
            `${anu.participants[0].split("@")[0]}@c.us`
          );
        } catch {
          ppimg =
            "https://i0.wp.com/www.gambarunik.id/wp-content/uploads/2019/06/Top-Gambar-Foto-Profil-Kosong-Lucu-Tergokil-.jpg";
        }

        let buffer = await getBuffer(
          `https://api-yogipw.herokuapp.com/api/demote?name=${anu_user}&msg=yahahaha didemote&mem=${groupAdmins.length}&picurl=${ppimg}&bgurl=https://cdn.discordapp.com/attachments/819995259261288475/835055559941292032/style.jpg`
        );
        teks = `${anu_user} Telah didemote`;
        denz.sendMessage(mdata.id, buffer, MessageType.image, {
          caption: teks,
        });
      }
    } catch (e) {
      console.log("Error : %s", color(e, "red"));
    }
  });
  //
  denz.on("message-delete", async (m) => {
    if (m.key.remoteJid == "status@broadcast") return;
    if (!m.key.fromMe && m.key.fromMe) return;
    m.message =
      Object.keys(m.message)[0] === "ephemeralMessage"
        ? m.message.ephemeralMessage.message
        : m.message;
    const jam = moment.tz("Asia/Jakarta").format("HH:mm:ss");
    let d = new Date();
    let locale = "id";
    let gmt = new Date(0).getTime() - new Date("1 Januari 2021").getTime();
    let weton = ["Pahing", "Pon", "Wage", "Kliwon", "Legi"][
      Math.floor((d * 1 + gmt) / 84600000) % 5
    ];
    let week = d.toLocaleDateString(locale, { weekday: "long" });
    let calender = d.toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const type = Object.keys(m.message)[0];
    denz.sendMessage(
      m.key.remoteJid,
      `\`\`\`「 Anti Delete 」\`\`\`
  •> Nama : @${m.participant.split("@")[0]}
  •> Waktu : ${jam} ${week} ${calender}
  •> Type : ${type}`,
      MessageType.text,
      { quoted: m.message, contextInfo: { mentionedJid: [m.participant] } }
    );

    denz.copyNForward(m.key.remoteJid, m.message);
  });
  denz.on("chat-update", async (message) => {
    require("./index.js")(denz, message);
  });
  isBattre = "Not Detect"; //
  isCharge = "Not Detect"; //
  denz.on(`CB:action,,battery`, (json) => {
    const batteryLevelStr = json[2][0][1].value;
    const batterylevel = parseInt(batteryLevelStr);
    isBattre = batterylevel + "%";
    isCharge = json[2][0][1].live;
  });
  denz.on("CB:Blocklist", (json) => {
    if (blocked.length > 2) return;
    for (let i of json[1].blocklist) {
      blocked.push(i.replace("c.us", "s.whatsapp.net"));
    }
  });
};

/**
 * Uncache if there is file change
 * @param {string} module Module name or path
 * @param {function} cb <optional>
 */
function nocache(module, cb = () => {}) {
  console.log("Module", `'${module}'`, "is now being watched for changes");
  fs.watchFile(require.resolve(module), async () => {
    await uncache(require.resolve(module));
    cb(module);
  });
}

/**
 * Uncache a module
 * @param {string} module Module name or path
 */
function uncache(module = ".") {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(module)];
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}

starts();
