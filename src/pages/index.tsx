import { type NextPage } from "next";
import Head from "next/head";
import {
  type ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi,
} from "openai";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

if (!process.env.NEXT_PUBLIC_OPEN_AI_API_KEY) {
  throw new Error("Missing API key");
}
const configuration = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPEN_AI_API_KEY,
});

const openai = new OpenAIApi(configuration);

type StoryBlock = {
  img?: string;
} & ChatCompletionRequestMessage;

const systemPrompt: StoryBlock = {
  role: "system",
  content: `Create an infocom style text adventure
  game I can play using this prompt box. Provide 3 options for me. Use the format:
  **Option 1**
  **Option 2**
  **Option 3**
  `,
};
const initialQuestion: StoryBlock = {
  role: "assistant",
  content: "What is your story about?",
};

const Home: NextPage = () => {
  const [userInput, setUserInput] = useState("");
  const [conversation, setConversation] = useState<StoryBlock[]>([
    initialQuestion,
  ]);

  // useEffect(() => {
  //   console.log(userInput);
  // }, [userInput]);
  return (
    <>
      <Head>
        <title>AI story journey App</title>
        <meta name="description" content="AI story journey" />
        <link rel="icon" href="" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-800">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Create your AI story journey!
          </h1>
          <div className="min-h-full w-full max-w-4xl divide-y-4 divide-slate-800 bg-white">
            {/* {dummyConversation.map((c, i) => (
              <ConversationBox conversation={c} key={i} />
            ))} */}
            {conversation.map((c, i) => (
              <ConversationBox conversation={c} key={i} />
            ))}
            <UserInputBox
              userInput={userInput}
              setUserInput={setUserInput}
              conversation={conversation}
              setConversation={setConversation}
            />
          </div>
        </div>
      </main>
    </>
  );
};

const ConversationBox: React.FC<{
  conversation: StoryBlock;
}> = ({ conversation }) => {
  return (
    <div className=" gap-4 p-3">
      {conversation.img && (
        <div className="flex max-w-xl items-center ">
          <div
            className="group aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100"
            // href={"trips/" + String(Number(trip.id) - 1)}
          >
            <img
              src={conversation.img}
              // src={
              //   "https://media.discordapp.net/attachments/1065979213099843777/1089979861516439722/820d95b0-2744-41ad-a486-de155e48c93c.jpg?width=1138&height=1138"
              // }
              alt=""
              className="pointer-events-none object-cover group-hover:opacity-75"
            />
          </div>
        </div>
      )}
      <div className="p-5">
        <ReactMarkdown>{conversation.content}</ReactMarkdown>
      </div>
      {/* <div className="flex space-x-3 overflow-scroll">
        <button
          type="button"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          https://media.discordapp.net/attachments/1065979213099843777/1089979861516439722/820d95b0-2744-41ad-a486-de155e48c93c.jpg?width=1138&height=1138{" "}
        </button>
        <button
          type="button"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Button text
        </button>
        <button
          type="button"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Button text
        </button>
      </div> */}

      {/* profile pic */}
      {/* <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-500 p-6">
        <div>
          {conversation.role === "user" ? (
            <UserIcon></UserIcon>
          ) : (
            <AssistantIcon />
          )}
        </div>
      </div>
      <div className="">
        <p className="italic text-slate-600">{conversation.role}</p>
        <p>{conversation.content}</p>
      </div> */}
    </div>
  );
};

const UserInputBox: React.FC<{
  userInput: string;
  setUserInput: Dispatch<SetStateAction<string>>;
  conversation: StoryBlock[];
  setConversation: Dispatch<SetStateAction<StoryBlock[]>>;
}> = ({ userInput, setUserInput, conversation, setConversation }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (newUserInput: string = userInput) => {
    setIsLoading(true);

    const conversationText: ChatCompletionRequestMessage[] = conversation.map(
      (e) => ({ role: e.role, content: e.content })
    );

    const assistantResponseObj = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        systemPrompt,
        ...conversationText,
        { role: "user", content: newUserInput },
      ],
    });

    const assistantResponse =
      assistantResponseObj?.data?.choices[0]?.message?.content || "";
    console.log(newUserInput, assistantResponse, [
      ...conversation,
      { role: "user", content: newUserInput },
      { role: "assistant", content: assistantResponse },
    ]);

    const response = await openai.createImage({
      prompt: assistantResponse,
      n: 1,
      size: "1024x1024",
    });
    const image = response.data?.data[0]?.url;
    console.log(image);
    setConversation([
      ...conversation,
      // { role: "user", content: newUserInput },
      { role: "assistant", content: assistantResponse, img: image },
    ]);
    setUserInput("");
    setIsLoading(false);
  };

  return (
    <div className="flex items-center bg-slate-300">
      {/* User Input */}
      {conversation.length > 1 ? (
        <>
          {isLoading ? (
            <div className="m-5">
              <Spinner />
            </div>
          ) : (
            <div className="m-5 flex space-x-3 overflow-scroll">
              {["1", "2", "3"].map((e) => (
                <button
                  key={e}
                  type="button"
                  className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  onClick={() => {
                    // setUserInput("1");
                    void handleClick(e);
                  }}
                >
                  Option {e}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <textarea
            className="m-3 w-9/12 p-3"
            onChange={(e) => setUserInput(e.target.value)}
            value={userInput}
            disabled={isLoading}
          ></textarea>
          <div className="m-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-500 p-6">
            {isLoading ? (
              <div>
                <Spinner />
              </div>
            ) : (
              <div onClick={() => void handleClick()}>
                <NextIcon></NextIcon>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const UserIcon: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="white"
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
};

const Spinner: React.FC = () => {
  return (
    <svg
      className="h-5 w-5 animate-spin text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};

const NextIcon: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="white"
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
      />
    </svg>
  );
};

const AssistantIcon: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="white"
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z"
      />
    </svg>
  );
};

export default Home;
