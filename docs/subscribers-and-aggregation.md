# Logic for Subscriber and Users

<!-- Commented-out image -->
<!-- ![My Image](image.png) -->

<p align="center">
  <img src="image.png" alt="Alt text" width="750"/> <br>
</p>

# Channel se Subscriber Milte hai, Subscriber se Channel

## About Our Subscriber Model:

1. Our Subscriber Model has two fields: **Subscriber** and **Channel**, and both of them are User.
2. What happens when a user subscribes a channel ??
3. Let's Suppose, Channels are: **GFG, CWC, FCC** and Users are: **a, b, c, d**.
4. Now, let's suppose **a** subscribes to **GFG**, then a separate document gets created:  
   - Channel: *GFG*  
   - Subscriber: *a*
5. Now, **a** can subscribe to multiple channels. Let's say it subscribes to *CWC* as well, then another document gets created:  
   - Channel: *CWC*  
   - Subscriber: *a*
6. Also, multiple users can subscribe to the same channel. Let's say **b, c** subscribe to *CWC* as well:  
   - Channel: *CWC* → Subscriber: *b*  
   - Channel: *CWC* → Subscriber: *c*
7. **Aim**: To get the Subscribers of **CWC**:  
   Count all the docs where *Channel = CWC*. *(Channel se Subscriber)*
8. **Aim**: To get how many channels **a** has subscribed:  
   Count all the docs where *Subscriber = a*, and from each doc list the Channels. *(Subscriber se Channel)*
9. In this example:  
   - **CWC** has 3 subscribers  
   - **a** subscribed to 2 channels {*CWC* and *GFG*}

---

## How have we implemented it here:

# Aggregation Pipelines

## What are Aggregation Pipelines?

"An aggregation pipeline consists of one or more **stages** that process documents. These documents can come from a collection, a view, or a specially designed stage."

Each stage performs an operation on the input documents.  
The documents that a stage outputs are then passed to the next stage in the pipeline.

Aggregation pipelines run with the `db.collection.aggregate()` method.

---

## Commonly Used Aggregation Functions:

MongoDB Aggregation Framework provides many powerful operators, but there are some that we commonly use in **backend projects**, especially for analytics, joins, and profile data.

Below are the most frequently used stages:

---

### 1. `$match`
Filters documents based on specific conditions.  
It works like the `WHERE` clause in SQL.

```js
{ $match: { username: "cwc" } }
```

---

### 2. `$lookup`
Performs a **join** between two collections.  
This is how we fetched subscribers and subscribed channels.

```js
{
  $lookup: {
     from: "subscriptions",
     localField: "_id",
     foreignField: "channel",
     as: "subscribers"
  }
}
```

---

### 3. `$addFields`
Adds new calculated fields or modifies existing ones.

We used it to create:

- `subscribersCount`
- `channelSubscribedToCount`
- `isSubscribed`

```js
{
  $addFields: {
     subscribersCount: { $size: "$subscribers" }
  }
}
```

---

### 4. `$project`
Allows selecting only the fields needed in the final output.  
Helps in returning a clean response to the client.

```js
{
  $project: {
     username: 1,
     avatar: 1,
     subscribersCount: 1
  }
}
```

---

### 5. `$group`
Used for grouping documents and applying aggregated calculations like:

- `$sum`
- `$avg`
- `$max`
- `$min`
- `$push`
- `$addToSet`

Example:

```js
{
  $group: {
     _id: "$channel",
     totalSubscribers: { $sum: 1 }
  }
}
```

---

### 6. `$sort`
Sorts the documents.

```js
{ $sort: { createdAt: -1 } }  // latest first
```

---

### 7. `$limit` and `$skip`
Used for **pagination** — skipping documents and limiting output.

---

### 8. `$unwind`
Deconstructs an array field so that each element becomes a separate document.

Useful when you want to operate on **individual items of an array**.

---

### 9. `$facet`
Runs multiple pipelines in parallel and combines results.

Useful for:

- Pagination + Count  
- Combined filters  
- Dashboard queries  

```js
{
  $facet: {
     data: [ { $skip: 10 }, { $limit: 10 } ],
     totalCount: [ { $count: "count" } ]
  }
}
```

---

### 10. `$cond`
Implements **if/else logic** inside aggregation.

We used it for:

```js
isSubscribed: {
   $cond: {
      if: { $in: [req.user._id, "$subscribers.subscriber"] },
      then: true,
      else: false
   }
}
```

---

### 11. Comparison Operators (Very Common)

#### `$in`
Checks if a value exists inside an array.

#### `$eq`, `$gt`, `$lt`, `$and`, `$or`
Used heavily inside `$match`, `$addFields`, `$project`.

---

### 12. `$filter`
Used to filter elements **inside an array**.

```js
{
  $filter: {
    input: "$comments",
    as: "c",
    cond: { $eq: ["$$c.isPinned", true] }
  }
}
```

---

### 13. `$map`
Transforms each element in an array.

---

### 14. `$count`
Returns the number of documents.

```js
{ $count: "total" }
```

---

## Example: `getUserChannelProfile` controller (full code)

```js
const getUserChannelProfile = asyncHandler(async (req, res) => {
   const { username } = req.params;

   if (!username?.trim()) {
      throw new ApiError(400, "Username Not Defined");
   }

   const channel = await User.aggregate([
      {
         $match: {
            username: username?.toLowerCase()
         }
      },
      {
         $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
         }
      },
      {
         $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo"
         }
      },
      {
         $addFields: {
            subscribersCount: {
               $size: "$subscribers"
            },
            channelSubscribedToCount: {
               $size: "$subscribedTo"
            },
            isSubscribed: {
               $cond: {
                  if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                  then: true,
                  else: false
               }
            }
         }
      },
      {
         $project: {
            fullName: 1,
            username: 1,
            subscribersCount: 1,
            channelSubscribedToCount: 1,
            avatar: 1,
            coverImage: 1,
            email: 1,
            isSubscribed: 1
         }
      }
   ]);

   if (!channel?.length) {
      throw new ApiError(404, "channel does not exists");
   }

   return res.status(200).json(new ApiResponse(200, channel[0], "User channel fetched successfully"));
});
```

---

## Subscription Schema (for reference)

```js
import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
```

---

## Final Notes & Best Practices

- **Indexing**: Index `channel` and `subscriber` fields in the `subscriptions` collection for fast lookups.
- **Projection**: Always project only necessary fields before sending response to clients to reduce payload.
- **Use `$facet` for pagination + total count in one query** to avoid two database roundtrips.
- **Watch memory**: `$lookup` and `$unwind` can create big intermediate arrays — be mindful with large collections.
- **Consider pre-aggregating** counts in a separate collection or caching layer (Redis) for very high-traffic channels.

---

# End of File
