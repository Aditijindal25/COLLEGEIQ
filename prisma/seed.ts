import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const colleges = [
  {
    name: "IIT Delhi",
    location: "New Delhi",
    state: "Delhi",
    fees: 245000,
    rating: 4.8,
    placement: 24.0,
    description:
      "Indian Institute of Technology Delhi is a premier engineering and technology institute known for academic excellence, research, and strong industry connections.",
    website: "https://home.iitd.ac.in/",
    courses: [
      {
        name: "Computer Science and Engineering",
        duration: "4 Years",
        degree: "B.Tech",
      },
      {
        name: "Electrical Engineering",
        duration: "4 Years",
        degree: "B.Tech",
      },
    ],
    reviews: [
      {
        rating: 5,
        comment: "Excellent academics and strong placement opportunities.",
        author: "Rahul",
      },
      {
        rating: 4,
        comment: "Great campus and research environment.",
        author: "Priya",
      },
    ],
  },

  {
    name: "IIT Bombay",
    location: "Mumbai",
    state: "Maharashtra",
    fees: 240000,
    rating: 4.7,
    placement: 25.0,
    description:
      "IIT Bombay is one of India's leading institutes for engineering, technology, research, and innovation.",
    website: "https://www.iitb.ac.in/",
    courses: [
      {
        name: "Computer Science and Engineering",
        duration: "4 Years",
        degree: "B.Tech",
      },
      {
        name: "Mechanical Engineering",
        duration: "4 Years",
        degree: "B.Tech",
      },
    ],
    reviews: [
      {
        rating: 5,
        comment: "Excellent opportunities and vibrant student life.",
        author: "Ananya",
      },
      {
        rating: 4,
        comment: "Very strong technical ecosystem.",
        author: "Arjun",
      },
    ],
  },

  {
    name: "IIT Madras",
    location: "Chennai",
    state: "Tamil Nadu",
    fees: 230000,
    rating: 4.6,
    placement: 23.0,
    description:
      "IIT Madras is a leading institute offering world-class education, research, and innovation across engineering and technology.",
    website: "https://www.iitm.ac.in/",
    courses: [
      {
        name: "Computer Science and Engineering",
        duration: "4 Years",
        degree: "B.Tech",
      },
      {
        name: "Artificial Intelligence and Data Science",
        duration: "4 Years",
        degree: "B.Tech",
      },
    ],
    reviews: [
      {
        rating: 5,
        comment: "Excellent academics and research opportunities.",
        author: "Karan",
      },
      {
        rating: 4,
        comment: "Strong placements and campus facilities.",
        author: "Meera",
      },
    ],
  },

  {
    name: "IIT Kanpur",
    location: "Kanpur",
    state: "Uttar Pradesh",
    fees: 225000,
    rating: 4.6,
    placement: 22.5,
    description:
      "IIT Kanpur is renowned for its rigorous academic environment, research programs, and engineering education.",
    website: "https://www.iitk.ac.in/",
    courses: [
      {
        name: "Computer Science and Engineering",
        duration: "4 Years",
        degree: "B.Tech",
      },
      {
        name: "Aerospace Engineering",
        duration: "4 Years",
        degree: "B.Tech",
      },
    ],
    reviews: [
      {
        rating: 5,
        comment: "Academically challenging with excellent faculty.",
        author: "Rohan",
      },
    ],
  },

  {
    name: "NIT Trichy",
    location: "Tiruchirappalli",
    state: "Tamil Nadu",
    fees: 180000,
    rating: 4.4,
    placement: 18.5,
    description:
      "NIT Trichy is a premier technical institute with strong engineering programs and excellent industry connections.",
    website: "https://www.nitt.edu/",
    courses: [
      {
        name: "Computer Science and Engineering",
        duration: "4 Years",
        degree: "B.Tech",
      },
      {
        name: "Electronics and Communication Engineering",
        duration: "4 Years",
        degree: "B.Tech",
      },
    ],
    reviews: [
      {
        rating: 5,
        comment: "Great placement opportunities for engineering students.",
        author: "Vivek",
      },
    ],
  },

  {
    name: "NIT Warangal",
    location: "Warangal",
    state: "Telangana",
    fees: 175000,
    rating: 4.3,
    placement: 17.8,
    description:
      "NIT Warangal is a prominent engineering institute offering strong technical education and industry-oriented programs.",
    website: "https://www.nitw.ac.in/",
    courses: [
      {
        name: "Computer Science and Engineering",
        duration: "4 Years",
        degree: "B.Tech",
      },
      {
        name: "Electrical and Electronics Engineering",
        duration: "4 Years",
        degree: "B.Tech",
      },
    ],
    reviews: [
      {
        rating: 4,
        comment: "Good academics and strong technical culture.",
        author: "Aditya",
      },
    ],
  },

  {
    name: "BITS Pilani",
    location: "Pilani",
    state: "Rajasthan",
    fees: 520000,
    rating: 4.5,
    placement: 20.5,
    description:
      "BITS Pilani is a leading private university known for engineering education, entrepreneurship, research, and industry exposure.",
    website: "https://www.bits-pilani.ac.in/",
    courses: [
      {
        name: "Computer Science",
        duration: "4 Years",
        degree: "B.E.",
      },
      {
        name: "Electronics and Instrumentation",
        duration: "4 Years",
        degree: "B.E.",
      },
    ],
    reviews: [
      {
        rating: 5,
        comment: "Excellent exposure to technology and entrepreneurship.",
        author: "Nisha",
      },
    ],
  },

  {
    name: "IIIT Hyderabad",
    location: "Hyderabad",
    state: "Telangana",
    fees: 420000,
    rating: 4.5,
    placement: 22.0,
    description:
      "IIIT Hyderabad specializes in computer science, artificial intelligence, research, and technology-driven education.",
    website: "https://www.iiit.ac.in/",
    courses: [
      {
        name: "Computer Science and Engineering",
        duration: "4 Years",
        degree: "B.Tech",
      },
      {
        name: "Electronics and Communication Engineering",
        duration: "4 Years",
        degree: "B.Tech",
      },
    ],
    reviews: [
      {
        rating: 5,
        comment: "Excellent computer science ecosystem.",
        author: "Aarav",
      },
    ],
  },
];

async function main() {
  await prisma.review.deleteMany();
  await prisma.course.deleteMany();
  await prisma.college.deleteMany();

  for (const college of colleges) {
    await prisma.college.create({
      data: {
        name: college.name,
        location: college.location,
        state: college.state,
        fees: college.fees,
        rating: college.rating,
        placement: college.placement,
        description: college.description,
        website: college.website,

        courses: {
          create: college.courses,
        },

        reviews: {
          create: college.reviews,
        },
      },
    });
  }

  console.log(`Seeded ${colleges.length} colleges successfully.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });