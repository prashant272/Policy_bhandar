require('dotenv').config();
const mongoose = require('mongoose');
const Testimonial = require('./models/Testimonial');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/policybhandar';

const testimonials = [
  {
    name: 'Pavitra Yadav',
    designation: 'Customer',
    message: 'I can clearly see the benefits of this training. I wholely enjoy the materials you gave to us. The contents are so informative and valuable. Thank you Yogendra sir.',
    rating: 5,
    isApproved: true
  },
  {
    name: 'Pratik Jain',
    designation: 'Agent',
    message: 'Today traning session was unmatchable. many new things was learn. ( Prospecting, Recruitment, Zen Multipler. etc).. Yogendra ji what you taught will help us a lot in increasing our business. We will give the result of this through our business. Lot of thanks for Yogendra Verma ji and all tata group',
    rating: 5,
    isApproved: true
  },
  {
    name: 'Mahira Singh',
    designation: 'Customer',
    message: "Today's training session by Yogendra Verma sir was a tremendous value addition to my learning as a Leader. Looking forward for tommorow's session as I got much in depth knowledge on distribution creation and also got a revision done on PAPSDR.........THANK YOU Yogendra SIR🤝👏💐",
    rating: 5,
    isApproved: true
  },
  {
    name: 'Ajay Saini',
    designation: 'Agent',
    message: "Many New things I learnt today, Yogendra Sir's training very great, learnt every year we should make at least 20 advisors in our team, quality requirements, make More LP and help for the endipendent many more. Great things in this training his smile as start as end of the training session. 😇🙏",
    rating: 5,
    isApproved: true
  }
];

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB');
    // Clear old testimonials (optional, let's keep them if there are any, or just insert these new ones)
    // await Testimonial.deleteMany({});
    await Testimonial.insertMany(testimonials);
    console.log('Testimonials seeded successfully!');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
