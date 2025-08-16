// discordTools.test.js
const discordTools = require("./index");
const { defaultEmbedColorHEX } = require("./config.json");
const { Collection } = require("discord.js");

// Mock regexworld for mention parsing
jest.mock("regexworld", () => ({
  setStr: jest.fn(() => ({
    setRegex: jest.fn().mockReturnThis(),
    regexStart: jest.fn((_, callback) => {
      callback(null, [[null, "123"]]);
    }),
  })),
}));

describe("discordTools", () => {
  let mockChannel, mockMessage, mockMember, mockGuild;

  beforeEach(() => {
    // Mock channel
    mockChannel = {
      send: jest.fn().mockResolvedValue({ delete: jest.fn() }),
      messages: {
        fetch: jest.fn().mockResolvedValue([{ id: "1" }, { id: "2" }]),
      },
      bulkDelete: jest.fn(),
      awaitMessages: jest.fn(),
    };

    // Mock member
    mockMember = {
      hasPermission: jest.fn().mockReturnValue(true),
      user: { username: "TestUser", id: "123" },
    };

    // Mock guild with Collection for members.cache
    mockGuild = {
      me: { hasPermission: jest.fn().mockReturnValue(true) },
      members: {
        cache: new Collection([["123", mockMember]]),
      },
    };

    // Mock message
    mockMessage = {
      channel: mockChannel,
      member: mockMember,
      guild: mockGuild,
      delete: jest.fn(),
      reply: jest.fn().mockResolvedValue({ delete: jest.fn() }),
      content: "test",
      author: { id: "123" },
    };
  });

  // --- embed tests ---
  test("embed sends a message with default color", async () => {
    await discordTools.embed(mockChannel, "Hello");
    expect(mockChannel.send).toHaveBeenCalledWith({
      embed: { description: "Hello", color: defaultEmbedColorHEX },
    });
  });

  // --- arrayRandom tests ---
  test("arrayRandom returns an element from array", () => {
    const arr = [1, 2, 3];
    const result = discordTools.arrayRandom(arr);
    expect(arr).toContain(result);
  });

  // --- purge tests ---
  test("purge logs error if amount is not a number", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    await discordTools.purge(mockMessage, {}, "notanumber");
    expect(logSpy).toHaveBeenCalledWith("AMOUNT is NOT A NUMBER");
    logSpy.mockRestore();
  });

  test("purge deletes messages if valid amount", async () => {
    mockMessage.channel.type = "text";
    await discordTools.purge(mockMessage, {}, 2);
    expect(mockChannel.messages.fetch).toHaveBeenCalledWith({ limit: 3 });
    expect(mockChannel.bulkDelete).toHaveBeenCalled();
  });

  // --- messageCollector tests ---
  test("messageCollector sends reaction on yes", async () => {
    mockChannel.awaitMessages.mockResolvedValue({ first: () => ({ content: "yes" }) });
    await discordTools.messageCollector(mockMessage, "Question?", "Reaction!");
    expect(mockChannel.send).toHaveBeenCalledWith("Question?");
    expect(mockChannel.send).toHaveBeenCalledWith("Reaction!");
  });

  test("messageCollector logs \"Nope\" on no", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    mockChannel.awaitMessages.mockResolvedValue({ first: () => ({ content: "no" }) });
    await discordTools.messageCollector(mockMessage, "Question?", "Reaction!");
    expect(logSpy).toHaveBeenCalledWith("Nope");
    logSpy.mockRestore();
  });

  test("messageCollector sends \"Time ran out!\" on timeout", async () => {
    mockChannel.awaitMessages.mockRejectedValue(new Error("time"));
    await discordTools.messageCollector(mockMessage, "Question?", "Reaction!");
    expect(mockChannel.send).toHaveBeenCalledWith("Time ran out!");
  });

  // --- fetchMember tests ---
  test("fetchMember resolves member by ID", async () => {
    const member = await discordTools.fetchMember(mockMessage, "123");
    expect(member).toBe(mockMember);
  });

  test("fetchMember resolves member by mention", async () => {
    const member = await discordTools.fetchMember(mockMessage, "<@123>");
    expect(member).toBe(mockMember);
  });

  test("fetchMember rejects if username not found", async () => {
    await expect(discordTools.fetchMember(mockMessage, "NotExist"))
      .rejects.toThrow("Couldn't find someone with this username");
  });

  test("fetchMember resolves member when multiple users match username", async () => {
    const member1 = { user: { username: "Test", id: "1" } };
    const member2 = { user: { username: "Test", id: "2" } };
    mockGuild.members.cache = new Collection([
      ["1", member1],
      ["2", member2],
    ]);

    const mockMsgToDelete = { delete: jest.fn() };
    mockChannel.send = jest.fn().mockResolvedValue(mockMsgToDelete);
    mockChannel.awaitMessages = jest.fn().mockResolvedValue({ first: () => ({ content: "2", author: { id: "123" } }) });

    const resolvedMember = await discordTools.fetchMember(mockMessage, "Test");
    expect(resolvedMember).toBe(member2);
    expect(mockMsgToDelete.delete).toHaveBeenCalled();
  });
});
