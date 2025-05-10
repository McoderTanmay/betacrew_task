const net = require("net");
const fs = require("fs");
const { requestMissingPacket, parsePackets } = require("./helper");

const client = new net.Socket();
const dataChunks = [];

client.connect(3000, "127.0.0.1", () => {
  console.log("connected to server");

  const payload = Buffer.alloc(2);
  payload[0] = 1;
  payload[1] = 0;
  client.write(payload);
});

client.on("data", (data) => {
  dataChunks.push(data);
  client.end();
});

client.on("end", async () => {
  dataBuffer = Buffer.concat(dataChunks);
  const { data, seqNo } = parsePackets(dataBuffer);
  // console.log("Received packets: ", data);

  const stream = fs.createWriteStream("data.json");
  stream.write("[\n");
  data.forEach((packet)=>{
    stream.write(JSON.stringify(packet, null, 2) + "," +"\n");
  })

  const missingSeq = [];
  const sequences = Array.from(seqNo).sort((a, b) => a - b);

  for (let i = sequences[0]; i <= sequences[sequences.length - 1]; i++) {
    if (!seqNo.has(i)) {
      missingSeq.push(i);
    }
  }
  if (missingSeq.length === 0) {
    return;
  }
  console.log("resending missing data");
  for (const seq of missingSeq) {
    const isLast = seq === missingSeq[missingSeq.length - 1];
    try {
      const resentData = await requestMissingPacket(seq);
      // console.log(`${seq} resent data: `, resentData);
      if(!isLast){
        stream.write(JSON.stringify(resentData[0], null, 2) + "," + "\n");
      }
      else{
        stream.write(JSON.stringify(resentData[0], null, 2)+ "\n");
      }
      
    } catch (error) {
      console.log(`failed to get data of sequence number- ${seq}`);
    }
  }
  stream.write("]\n");
  stream.end();
  console.log("connection close");
});

client.on("error", (err) => {
  console.log(err);
});

client.on("close", () => {
  console.log("Initial connection closed");
});




