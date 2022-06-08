import CommonService from "./common";
import { ITagApi, tagModel, tagSharedModel } from "../models/datadb/Tags";

/**
 * Provide services related to the tags of a user.
 */
export default class TagService extends CommonService {
  static apiFields: string =
    "_id dId lId userId tag deleted encKey encConfig createTs updateTs deleteTs schemaVersion";

  /**
   * Add a tag for a user.
   *
   * @param dId The device ID where created.
   * @param lId The local ID in the application.
   * @param userId The user's ID
   * @param tag The tag text
   * @param encKey Unique encryption key
   * @param encConfig Encryption schema used for encryption
   * @param createTs Creation timestamp
   * @param schemaVersion The model schema version
   * @returns Added tag object [ITagApi] or [false].
   */
  static async addTag(
    dId: string,
    lId: string,
    userId: string,
    tag: string,
    encKey: string,
    encConfig: string,
    createTs: number,
    schemaVersion: number
  ): Promise<ITagApi | boolean> {
    const doc = (await tagModel.create({
      dId: dId,
      lId: lId,
      userId: userId,
      tag: tag,
      encKey: encKey,
      encConfig: encConfig,
      createTs: createTs,
      schemaVersion: schemaVersion,
    })) as ITagApi;

    if (doc) {
      return doc;
    } else {
      return false;
    }
  }

  /**
   * Add all tags for a user in a JSON.
   *
   * @param json Tags in an array.
   * @returns [true] or [false].
   */
  static async addTagsFromJson(json: Array<any>): Promise<boolean> {
    let success: boolean = true;

    for (const tag of json) {
      const doc = await tagModel.create({
        _id: tag._id,
        dId: tag.dId,
        lId: tag.lId,
        userId: tag.userId,
        deleted: tag.deleted,
        tag: tag.tag,
        encKey: tag.encKey,
        encConfig: tag.encConfig,
        createTs: tag.createTs,
        updateTs: Date.now(),
        deleteTs: tag.deleteTs,
        schemaVersion: tag.schemaVersion,
      });

      success &&= doc;

      if (!success) {
        break;
      }
    }

    return success;
  }

  /**
   * Add a shared tag for another user.
   *
   * @param dId The device ID where created.
   * @param lId The local ID in the application.
   * @param userId The user's ID
   * @param tag The shared tag text
   * @param encKey Unique encryption key
   * @param encConfig Encryption schema used for encryption
   * @param createTs Creation timestamp
   * @param schemaVersion The model schema version
   * @returns Added tag object [ITagApi] or [false].
   */
  static async addTagShared(
    dId: string,
    lId: string,
    userId: string,
    tag: string,
    encKey: string,
    encConfig: string,
    createTs: number,
    schemaVersion: number
  ): Promise<ITagApi | boolean> {
    const doc = (await tagSharedModel.create({
      dId: dId,
      lId: lId,
      userId: userId,
      tag: tag,
      encKey: encKey,
      encConfig: encConfig,
      createTs: createTs,
      schemaVersion: schemaVersion,
    })) as ITagApi;

    if (doc) {
      return doc;
    } else {
      return false;
    }
  }

  /**
   * Get all the tags of a user.
   *
   * @param userId The user ID for the account.
   * @returns Tag object Array[ITagApi] or [false].
   */
  static async getAllCurrentTags(
    userId: string
  ): Promise<Array<ITagApi> | boolean> {
    const tags = (await tagModel.find(
      {
        userId: userId,
        deleted: false,
      },
      TagService.apiFields
    )) as Array<ITagApi>;

    if (tags) {
      return tags;
    } else {
      return false;
    }
  }

  /**
   * Get all the current tags of a user for a backup.
   *
   * @param userId The user ID for the account.
   * @returns Tag object Array[ITagApi] or [false].
   */
  static async getAllTagsForBackup(
    userId: string
  ): Promise<Array<ITagApi> | boolean> {
    const tags = (await tagModel.find({
      userId: userId,
      deleted: false,
    })) as Array<ITagApi>;

    if (tags) {
      return tags;
    } else {
      return false;
    }
  }

  /**
   * Get all the tags shared by others with the current user.
   *
   * @param sharedTagIds The shared tag IDs for the user.
   * @returns Tag object Array[ITagApi] or [false].
   */
  static async getAllTagsSharedByOthers(
    sharedTagIds: string[]
  ): Promise<Array<ITagApi> | boolean> {
    const tags = (await tagSharedModel.find(
      {
        _id: {
          $in: sharedTagIds,
        },
        deleted: false,
      },
      TagService.apiFields
    )) as Array<ITagApi>;

    if (tags) {
      return tags;
    } else {
      return false;
    }
  }

  /**
   * Get the requested tags shared by a user with the current user.
   *
   * @param userId The ID of the user who shared.
   * @param sharedTagIds The shared tag IDs for the user.
   * @returns Type object Array[ITagApi] or [false].
   */
  static async getTagsSharedByUser(
    userId: string,
    sharedTagIds: string[]
  ): Promise<Array<ITagApi> | boolean> {
    const tags = (await tagSharedModel.find(
      {
        _id: {
          $in: sharedTagIds,
        },
        userId: userId,
        archived: false,
        recycled: false,
        deleted: false,
      },
      TagService.apiFields
    )) as Array<ITagApi>;

    if (tags) {
      return tags;
    } else {
      return false;
    }
  }

  /**
   * Get all the tags of a user for sync.
   *
   * @param userId The user ID for the account.
   * @returns Tag object Array[ITagApi] or [false].
   */
  static async getAllTagsSync(
    userId: string
  ): Promise<Array<ITagApi> | boolean> {
    const tags = (await tagModel.find(
      {
        userId: userId,
      },
      TagService.apiFieldsSync
    )) as Array<ITagApi>;

    if (tags) {
      return tags;
    } else {
      return false;
    }
  }

  /**
   * Get all the tags shared with a user for sync.
   *
   * @param tagIds The IDs of the tags shared with a user.
   * @returns Tag object Array[ITagApi] or [false].
   */
  static async getAllTagsSharedSync(
    tagIds: string[]
  ): Promise<Array<ITagApi> | boolean> {
    const tags = (await tagSharedModel.find(
      {
        _id: {
          $in: tagIds,
        },
      },
      TagService.apiFieldsSyncShared
    )) as Array<ITagApi>;

    if (tags) {
      return tags;
    } else {
      return false;
    }
  }

  /**
   * Get a tag of a user.
   *
   * @param userId The user's ID
   * @param tagId The tag ID of the required tag.
   * @returns Tag object [ITagApi] or [false].
   */
  static async getTag(
    userId: string,
    tagId: string
  ): Promise<ITagApi | boolean> {
    const tag = (await tagModel.findOne(
      {
        _id: tagId,
        userId: userId,
        deleted: false,
      },
      TagService.apiFields
    )) as ITagApi;

    if (tag) {
      return tag;
    } else {
      return false;
    }
  }

  /**
   * Get a tag shared by another user.
   *
   * @param userId The user's ID
   * @param tagId The shared tag ID.
   * @returns Tag object [ITagApi] or [false].
   */
  static async getTagShared(
    userId: string,
    tagId: string
  ): Promise<ITagApi | boolean> {
    const tag = (await tagSharedModel.findOne(
      {
        _id: tagId,
        userId: userId,
        deleted: false,
      },
      TagService.apiFields
    )) as ITagApi;

    if (tag) {
      return tag;
    } else {
      return false;
    }
  }

  /**
   * This is a generic update method that does an atomic update,
   * and can be reused by other methods that update one or more document fields.
   *
   * @param userId The user's ID
   * @param tagId The tag ID to be updated.
   * @returns [true] or [false].
   */
  static async updateTag(
    userId: string,
    tagId: string,
    updates: Object,
    updateTs: number = Date.now()
  ): Promise<boolean> {
    const result = await tagModel.updateOne(
      {
        _id: tagId,
        userId: userId,
        deleted: false,
        $or: [{ updateTs: { $lt: updateTs } }, { updateTs: null }],
      },
      { ...updates, updateTs: updateTs }
    );

    if (result.acknowledged && result.modifiedCount > 0) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * This is a generic update method that does an atomic update,
   * and can be reused by other methods that update one or more document fields.
   *
   * @param userId The user's ID
   * @param tagId The shared tag ID to be updated.
   * @returns [true] or [false].
   */
  static async updateTagShared(
    userId: string,
    tagId: string,
    updates: Object,
    updateTs: number = Date.now()
  ): Promise<boolean> {
    const result = await tagSharedModel.updateOne(
      {
        _id: tagId,
        userId: userId,
        deleted: false,
        $or: [{ updateTs: { $lt: updateTs } }, { updateTs: null }],
      },
      { ...updates, updateTs: updateTs }
    );

    if (result.acknowledged && result.modifiedCount > 0) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Update the tag details.
   *
   * @param userId The user's ID
   * @param tagId The tag ID to be updated.
   * @param tag The tag name.
   * @param encKey Unique encryption key
   * @param encConfig Encryption schema used for encryption
   * @param updateTs Update timestamp
   * @param schemaVersion The model schema version
   * @returns [true] or [false].
   */
  static async updateTagDetails(
    userId: string,
    tagId: string,
    tag: string,
    encKey: string,
    encConfig: string,
    updateTs: number,
    schemaVersion: number
  ): Promise<boolean> {
    const result = await TagService.updateTag(
      userId,
      tagId,
      {
        tag: tag,
        encKey: encKey,
        encConfig: encConfig,
        schemaVersion: schemaVersion,
      },
      updateTs
    );

    if (result) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Update the shared tag details.
   *
   * @param userId The user's ID
   * @param tagId The tag ID to be updated.
   * @param tag The shared tag name.
   * @param encKey Unique encryption key
   * @param encConfig Encryption schema used for encryption
   * @param updateTs Update timestamp
   * @param schemaVersion The model schema version
   * @returns [true] or [false].
   */
  static async updateTagDetailsShared(
    userId: string,
    tagId: string,
    tag: string,
    encKey: string,
    encConfig: string,
    updateTs: number,
    schemaVersion: number
  ): Promise<boolean> {
    const result = await TagService.updateTagShared(
      userId,
      tagId,
      {
        tag: tag,
        encKey: encKey,
        encConfig: encConfig,
        schemaVersion: schemaVersion,
      },
      updateTs
    );

    if (result) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Soft delete a tag of a user.
   *
   * @param userId The user's ID
   * @param tagId The tag ID of the tag to be soft deleted.
   * @returns [true] or [false].
   */
  static async deleteSoftTag(
    userId: string,
    tagId: string,
    deleteTs: string
  ): Promise<boolean> {
    const result = await tagModel.updateOne(
      { _id: tagId, userId: userId, deleted: false },
      {
        tag: "",
        deleted: true,
        encKey: "",
        encConfig: "",
        deleteTs: deleteTs,
      }
    );

    if (result.acknowledged && result.modifiedCount > 0) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Fully delete a tag of a user.
   *
   * @param userId The user's ID.
   * @param tagId The tag ID of the tag to be soft deleted.
   * @returns [true] or [false].
   */
  static async deleteHardTag(userId: string, tagId: string): Promise<boolean> {
    const deleted = await tagModel.deleteOne({
      _id: tagId,
      userId: userId,
    });

    if (deleted && deleted.deletedCount) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Fully delete a shared tag of a user.
   *
   * @param userId The user's ID.
   * @param tagId The shared tag ID of the tag to be deleted.
   * @returns [true] or [false].
   */
  static async deleteHardTagShared(
    userId: string,
    tagId: string
  ): Promise<boolean> {
    const deleted = await tagSharedModel.deleteOne({
      _id: tagId,
      userId: userId,
    });

    if (deleted && deleted.deletedCount) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Fully delete all tags of a user.
   *
   * @param userId The user's ID.
   * @returns [true] or [false].
   */
  static async deleteHardTags(userId: string): Promise<boolean> {
    const deleted = await tagModel.deleteMany({
      userId: userId,
    });

    if (deleted && deleted.deletedCount) {
      return true;
    } else {
      return false;
    }
  }
}
