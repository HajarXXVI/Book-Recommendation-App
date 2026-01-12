import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

import util from 'util';

//protectRoute => only logged in users can create books
router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body; //the req sent for the creation of a book

    //verify all fields are present
    if (!image || !title || !caption || !rating) return res.status(400).json({ message: "Please provide all fields" });

    // upload the image to cloudinary and get the url
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    // save to the database (creation of the book)
    const newBook = new Book({
      title,
      caption,
      rating,
      image: imageUrl, //the url from cloudinary
      user: req.user._id, //the user who created the book (comes from the protectRoute middleware)
    });

    // save the user who created the book
    await newBook.save();

    res.status(201).json(newBook); //201 => created

  } catch (error) {
    console.error("Error creating book (safe log):", util.inspect(error, { showHidden: false, depth: 2, maxStringLength: 200 }));
    res.status(500).json({ message: "An error occurred during book creation" }); //500 => internal server error
  }
});

// pagination => infinite loading (load more on scroll)
router.get("/", protectRoute, async (req, res) => {
  // example call from react native - frontend
  // const response = await fetch("http://localhost:3000/api/books?page=1&limit=5"); //page 1, 5 books per page, as the user scrolls we increase the page number by 5 to get more books
  try {
    const page = req.query.page || 1; //default to page 1 if no page is provided
    const limit = req.query.limit || 2; //default to 2 books per page
    const skip = (page - 1) * limit; //number of books to skip based on the page number

    // fetch books from the database
    const books = await Book.find()
      .sort({ createdAt: -1 }) // descending order
      .skip(skip) // skip the books from previous pages
      .limit(limit) // limit the number of books returned
      .populate("user", "username profileImage"); // grab user info (username and profile image) who created the book from the userId in the book model

    // get total count of books
    const totalBooks = await Book.countDocuments();

    // send response with books and pagination info
    res.send({
      books,
      currentPage: page,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    });

  } catch (error) {
    console.log("Error in get all books route", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// get recommended books by the logged in user
router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 }); //find all books where the user field matches the logged in user's id
    res.json(books); //send the books as json response
  } catch (error) {
    console.error("Get user books error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// delete a book
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id); //we use req.params.id to get the id from the url (/:id)
    if (!book) return res.status(404).json({ message: "Book not found" });

    // check if user is the creator of the book
    if (book.user.toString() !== req.user._id.toString()) //convert both to string to compare
      return res.status(401).json({ message: "Unauthorized" });

    // https://res.cloudinary.com/de1rm4uto/image/upload/v1741568358/qyup61vejflxxw8igvi0.png //this is how cloudinary stores images
    // delete image from cloduinary first then delete the book from the database
    if (book.image && book.image.includes("cloudinary")) {
      try {
        //.split to extract the public id from the url & .pop to get the last part after the last / & .split again to remove the file extension
        const publicId = book.image.split("/").pop().split(".")[0]; //extracting the public id from the url (everything after the last / and before the . (qyup61vejflxxw8igvi0))
        await cloudinary.uploader.destroy(publicId); //deleting the image from cloudinary using the public id
      } catch (deleteError) {
        console.log("Error deleting image from cloudinary", deleteError);
      }
    }

    // delete the book from the database
    await book.deleteOne();

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.log("Error deleting book", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;