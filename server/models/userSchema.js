import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full Name is required"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username can't exceed 30 characters"],
      match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Password must be at least 8 characters"],
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^\+?[0-9]{7,15}$/.test(v.replace(/\s+/g, ""));
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    dob: {
      type: Date,
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      zip: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    bio: {
      type: String,
      maxlength: [500, "Bio can't exceed 500 characters"],
      default: "",
    },
    socialLinks: {
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      twitter: { type: String, default: "" },
      website: { type: String, default: "" },
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    photoUrl: {
      type: String,
      default: "",
    },
    lastLogin: {
      type: Date,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    language: {
      type: String,
      default: "en",
    },
    timeZone: {
      type: String,
      default: "UTC",
    },
    deviceInfo: {
      os: { type: String, default: "" },
      browser: { type: String, default: "" },
      ip: { type: String, default: "" },
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    accountVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      default: "",
    },
    verificationCodeExpire: {
      type: Date,
      default: Date.now,
    },
    resetPasswordToken: {
      type: String,
      default: "",
    },
    resetPasswordExpire: {
      type: Date,
      default: Date.now,
    },
    accountStatus: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    preferences: {
      theme: { type: String, default: "light" },
      notifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const MongooseUser = mongoose.model("User", userSchema);

// In-memory user store fallback used when an external MongoDB connection is unavailable
class InMemoryUserStore {
  constructor() {
    this.users = new Map();
  }

  _matchesQuery(user, query) {
    if (!query) return true;
    if (query.$or && Array.isArray(query.$or)) {
      return query.$or.some((subQuery) => this._matchesQuery(user, subQuery));
    }
    return Object.entries(query).every(([k, v]) => {
      if (k === "_id") return String(user._id) === String(v);
      return user[k] === v;
    });
  }

  _wrapUser(raw) {
    if (!raw) return null;
    return {
      ...raw,
      _id: raw._id,
      comparePassword: async (pwd) => bcrypt.compare(pwd, raw.password),
      save: async function () {
        if (this.password && this.password !== raw.password && !this.password.startsWith("$2")) {
          this.password = await bcrypt.hash(this.password, 10);
        }
        Object.assign(raw, this);
        return this;
      },
    };
  }

  async findOne(query) {
    for (const u of this.users.values()) {
      if (this._matchesQuery(u, query)) return this._wrapUser(u);
    }
    return null;
  }

  async findById(id) {
    const raw = this.users.get(String(id));
    if (!raw) return null;
    const wrapped = this._wrapUser(raw);
    return {
      ...wrapped,
      select: () => wrapped,
      then: (resolve) => Promise.resolve(wrapped).then(resolve),
    };
  }

  async create(data) {
    const id = "usr_" + Math.random().toString(36).substring(2, 10);
    const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : "";
    const doc = {
      _id: id,
      ...data,
      password: hashedPassword,
      accountStatus: data.accountStatus || "active",
      role: data.role || "user",
      accountVerified: !!data.accountVerified,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, doc);
    return this._wrapUser(doc);
  }

  async findByIdAndDelete(id) {
    const raw = this.users.get(String(id));
    if (!raw) return null;
    this.users.delete(String(id));
    return this._wrapUser(raw);
  }

  async deleteMany(filter) {
    let deletedCount = 0;
    for (const [id, user] of this.users.entries()) {
      if (this._matchesQuery(user, filter)) {
        this.users.delete(id);
        deletedCount++;
      }
    }
    return { deletedCount };
  }
}

const memoryStore = new InMemoryUserStore();

export const User = new Proxy(MongooseUser, {
  get(target, prop) {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      return target[prop];
    }
    if (prop in memoryStore) {
      return (...args) => memoryStore[prop](...args);
    }
    return target[prop];
  },
});
