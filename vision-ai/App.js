const express = require('express');
const cors = require('cors');
const vision = require('@google-cloud/vision');
const App = express();
App.use(cors());
App.use(express.json());

const client = new vision.ImageAnnotatorClient({ keyFilename: "csci5410-safe-deposit-c8ee7d8284ca.json"});

App.get('/calculatescores/:src/:dst/:bucket', (req, res) => {
  try {
    var src = req.params.src;
    var dst = req.params.dst;
    var bucket = req.params.bucket;

    getLabels(src, dst, bucket).then(value => {
      return res.status(200).json({
        success: true,
        message: "Calculated scores",
        data: value
      });
    })
  } 
  catch (ex) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
});

async function getLabels(src, dst, bucket) {
  const bucketName = 'image-bucket-group12';
  const srcFileName = bucket + '/' + src + '.jpeg';
  const dstFileName = bucket + '/' + dst + '.jpeg';

  const [srcResult] = await client.labelDetection(
    `gs://${bucketName}/${srcFileName}`
  );

  const [dstResult] = await client.labelDetection(
    `gs://${bucketName}/${dstFileName}`
  );

  const srcLabels = srcResult.labelAnnotations;
  const dstLabels = dstResult.labelAnnotations;

  var match = 0;
  srcLabels.forEach(srcLabel => {
    dstLabels.forEach(dstLabel => {
      if (srcLabel.description === dstLabel.description)
        match = match + 1;
    });
  });

  console.log(match);
  console.log(srcLabels.length);
  console.log((match / srcLabels.length) * 100);
  if ((match / srcLabels.length) * 100 > 50)
    return true;
  else
    return false;
}

module.exports = App;