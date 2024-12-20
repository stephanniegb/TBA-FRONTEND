"use client";
import { useState } from "react";
import { FAQs as FQAData } from "../../static";
import { DownChevronIcon } from "@public/icons";

type Props = {
  id: string;
  question: string;
  answer: string | string[];
  currentAccordion: string;
  toggleAccordion: ({ id }: { id: string }) => void;
};

const FQAs = () => {
  const [currentAccordion, setCurrentAccordion] = useState("FQ1");
  const toggleAccordion = ({ id }: { id: string }) => {
    if (currentAccordion === id) {
      setCurrentAccordion("");
    } else {
      setCurrentAccordion(id);
    }
  };

  return (
    <section className="mx-auto flex w-full flex-col gap-8 bg-gray-100 px-2 py-16 md:max-w-[1536px] md:px-4 lg:p-16">
      <h2 className="mx-auto w-full max-w-[200px] text-center md:max-w-[486px] 2xl:max-w-none">
        Frequently
        <span className="text-gradient"> Asked</span> Questions
      </h2>
      <section className="mx-auto flex w-full max-w-[35rem] flex-col gap-2 md:max-w-[50rem] md:gap-4 lg:max-w-[64rem]">
        {FQAData.map((items) => {
          const { answer, id, question } = items;

          return (
            <Accordion
              key={id}
              id={id}
              question={question}
              answer={answer}
              currentAccordion={currentAccordion}
              toggleAccordion={toggleAccordion}
            />
          );
        })}
      </section>
    </section>
  );
};

export default FQAs;

const Accordion = ({
  id,
  question,
  answer,
  currentAccordion,
  toggleAccordion,
}: Props) => {
  return (
    <div className="rounded-[8px] bg-white px-4 py-3 md:rounded-[12px] md:px-6">
      <button
        aria-expanded={currentAccordion === id}
        aria-label={`Toggle ${question} accordion`}
        onClick={() => toggleAccordion({ id: id })}
        className={`relative grid w-full grid-cols-10 items-center justify-between gap-8 transition-all duration-300 ease-in-out ${currentAccordion === id ? "dash-border-gradient text-foreground-secondary before:-bottom-2" : "text-foreground-tertiary"}`}
      >
        <span className="col-span-8 inline-block text-start">{question}</span>
        <div aria-hidden="true" className="col-span-2 flex justify-end">
          <span
            className={`flex h-[2rem] w-[2rem] items-center justify-center text-xl transition-all duration-300 ease-in-out ${
              currentAccordion === id ? "rotate-180" : "rotate-[0deg]"
            } `}
          >
            <DownChevronIcon />
          </span>
        </div>
      </button>
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          currentAccordion === id
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-2 py-6 md:w-[80%]">
            {Array.isArray(answer) ? (
              <ul className="flex list-disc flex-col gap-2 pl-6">
                {answer.map((line, index) => (
                  <li className="px-4" key={index}>
                    {line}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{answer}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
