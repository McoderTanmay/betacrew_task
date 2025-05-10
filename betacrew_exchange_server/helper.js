const net = require("net");

function requestMissingPacket(seqNo) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    const chunks = [];

    socket.connect(3000, "127.0.0.1", () => {
      const rPayload = Buffer.alloc(2);
      rPayload[0] = 2;
      rPayload[1] = seqNo;
      socket.write(rPayload);
    });

    socket.on("data", (data) => {
      chunks.push(data);
      const total = Buffer.concat(chunks);

      if (total.length >= 17) {
        const { data } = parsePackets(total);
        resolve(data);
        socket.end();
      }
    });

    socket.on("error", (err) => {
      console.log(`Error for seqNo ${seqNo}:`, err.message);
      reject(err);
    });

    socket.on("close", () => {
      console.log(`Connection closed for seqNo ${seqNo}`);
    });
  });
}

function parsePackets(buffer) {
  const packetSize = 17;
  const data = [];
  const seqNo = new Set();

  for (
    let offset = 0;
    offset + packetSize <= buffer.length;
    offset += packetSize
  ) {
    const symbol = buffer.slice(offset, offset + 4).toString("ascii");
    const bsInd = buffer.slice(offset + 4, offset + 5).toString("ascii");
    const quantity = buffer.readInt32BE(offset + 5);
    const price = buffer.readInt32BE(offset + 9);
    const packetSequence = buffer.readInt32BE(offset + 13);

    data.push({ symbol, bsInd, quantity, price, packetSequence });
    seqNo.add(packetSequence);
  }
  return { data, seqNo };
}

module.exports = { parsePackets, requestMissingPacket };
