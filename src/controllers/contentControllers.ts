import Express from "express";
import TextContent from "../models/TextContentModel";
import MediaContent from "../models/MediaContentModel";
import CardContent from "../models/CardContentModel";
import mongoose from "mongoose";
import supabaseMediaUpload from "../lib/supabaseMediaUpload";

const contentTypes = ["text", "media", "card"];
const pages = [
  "home",
  "about",
  "solutions",
  "services",
  "industries",
  "contact",
];
const contentModels: Record<string, mongoose.Model<any>> = {
  text: TextContent,
  media: MediaContent,
  card: CardContent,
};

export const getContent = async (
  req: Express.Request,
  res: Express.Response
) => {
  const origin = req.headers.origin;
  // console.log(req.cookies);

  const page = req.query.page;
  const contentType = req.query.contentType;

  if (!contentType) {
    return res.status(401).json({
      message: "please provide a content type to fetch",
    });
  }
  if (!page) {
    return res.status(401).json({
      message: "please provide page to fetch data from",
    });
  }
  if (!contentTypes.includes(contentType.toString())) {
    return res.status(401).json({
      message: `invalid content type ${contentType}`,
    });
  }
  if (!pages.includes(page.toString())) {
    return res.status(401).json({
      message: `could not find page ${page}`,
    });
  }

  const ContentModel = contentModels[contentType.toString()];
  try {
    const data = await ContentModel.findOne({ page: page });
    if (!data) return res.status(400).json({ message: "could not fetch data" });

    // res.headers.set("Access-Control-Allow-Origin", "http://localhost:3000");
    // res.headers.set("Access-Control-Allow-Credentials", "true");
    return res.status(200).json({
      data,
    });
  } catch (error) {
    return res.status(500).json({
      message: `some error occured in fetching the data ${error}`,
    });
  }
};

export const postContent = async (
  req: Express.Request,
  res: Express.Response
) => {
  const contentType = req.query.contentType;
  const page = req.query.page;
  const blockType = req.query.blockType;

  // console.log(contentType, page, blockType);
  // console.log(req.body);

  if (!contentType) {
    return res.status(400).json({
      message: "please provide a content type to post",
    });
  }
  if (!page) {
    return res.status(400).json({
      message: "please provide page to post data to",
    });
  }
  if (!blockType) {
    return res.status(400).json({
      message: "please provide block type to post data to",
    });
  }
  if (!contentTypes.includes(contentType.toString())) {
    return res.status(400).json({
      message: `invalid content type ${contentType}`,
    });
  }
  if (!pages.includes(page.toString())) {
    return res.status(400).json({
      message: `could not find page ${page}`,
    });
  }

  if (contentType === "text") {
    const { title, subtitle, text } = req.body;
    try {
      const data = await TextContent.findOneAndUpdate(
        { page: page },
        {
          $set: {
            "content.$[item].title": title || "",
            "content.$[item].subtitle": subtitle || "",
            "content.$[item].text": text || "",
          },
        },
        {
          arrayFilters: [{ "item.block_type": blockType }],
        }
      );

      // console.log(data);
      if (!data)
        return res.status(401).json({
          message:
            "could not post data. Possibly due to non existing block type",
        });

      return res.status(201).json({
        message: "successfully updated data",
        data: data,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: `some error occured in fetching the data`,
        error: error.message,
      });
    }
  }
  if (contentType === "media") {
		// console.log(req.files);
    try {
      if (!req.files || !req.files.media)
        return res.status(400).json({ message: "no file uploaded" });
      const media = req.files.media;
			console.log(media);
			
      const media_path = await supabaseMediaUpload(media!);
      console.log({media_path});
      if (!media_path)
        return res.status(401).json({ message: "could not upload file to supabase" });

      const data = await MediaContent.findOneAndUpdate(
        { page: page, "content.block_type": blockType },
        {
          $set: {
            "content.$[item].media_path": media_path || null,
          },
        },
        {
          arrayFilters: [{ "item.block_type": blockType }],
        }
      );

      // console.log(data);
      if (!data)
        return res.status(400).json({ message: "could not post data" });

      return res.status(200).json({
        message: "successfully updated data",
        data: data,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: `some error occured in fetching the data`,
        error: error.message,
      });
    }
  }
  if (contentType === "card") {
    const cards = await req.body?.cards;
		console.log(cards);
		
    // Validate body
    if (!cards || !Array.isArray(cards)) {
      return res.status(401).json({ message: "cards array is required" });
    }

    const newCards = cards.map((c: any) => ({
      ...c,
      _id: new mongoose.Types.ObjectId(c._id as string),
    }));

    try {
      const data = await CardContent.findOneAndUpdate(
        { page: page },
        {
          $set: {
            "content.$[item].cards": newCards,
          },
        },
        {
          arrayFilters: [{ "item.block_type": blockType }],
          new: true, // return updated doc
          strict: false, // do not strict check types and properties
        }
      );

      if (!data) {
        return res.status(400).json({
          message: `could not update card data. Possibly missing block_type "${blockType}"`,
        });
      }

      return res.status(201).json({
        message: "successfully updated card data",
        data,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "error updating card data",
        error: error.message,
      });
    }
  }
};
