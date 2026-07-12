import type { LegalDocument, LegalDocumentBlock } from "../legal.types";

type LegalDocumentContentProps = {
  document: LegalDocument;
};

export function LegalDocumentContent({ document }: LegalDocumentContentProps) {
  return (
    <div className="mt-8 space-y-10 text-base leading-8 break-keep text-text">
      {document.introduction?.map((paragraph, introductionIndex) => (
        <p key={`introduction-${introductionIndex}`}>{paragraph}</p>
      ))}

      {document.sections.map((section, sectionIndex) => {
        const sectionKey = `section-${sectionIndex}-${section.title}`;

        return (
          <section key={sectionKey} className="space-y-4">
            <h3 className="text-xl font-semibold leading-7 text-text">
              {section.title}
            </h3>

            {section.blocks.map((block, blockIndex) => (
              <DocumentBlock
                key={`${sectionKey}-block-${blockIndex}`}
                block={block}
                blockKey={`${sectionKey}-block-${blockIndex}`}
              />
            ))}
          </section>
        );
      })}

      {document.appendix ? (
        <section className="space-y-4">
          <h3 className="text-xl font-semibold leading-7 text-text">부칙</h3>
          {document.appendix.map((paragraph, appendixIndex) => (
            <p key={`appendix-${appendixIndex}`}>{paragraph}</p>
          ))}
        </section>
      ) : null}
    </div>
  );
}

function DocumentBlock({
  block,
  blockKey,
}: {
  block: LegalDocumentBlock;
  blockKey: string;
}) {
  switch (block.type) {
    case "paragraph":
      return <p>{block.text}</p>;

    case "ordered-list":
      return (
        <ol className="list-decimal space-y-2 pl-7">
          {block.items.map((item, itemIndex) => (
            <li key={`${blockKey}-item-${itemIndex}`}>{item}</li>
          ))}
        </ol>
      );

    case "unordered-list":
      return (
        <ul className="list-disc space-y-2 pl-6">
          {block.items.map((item, itemIndex) => (
            <li key={`${blockKey}-item-${itemIndex}`}>{item}</li>
          ))}
        </ul>
      );

    case "grouped-list":
      return (
        <div className="space-y-5">
          {block.groups.map((group, groupIndex) => (
            <div key={`${blockKey}-group-${groupIndex}`} className="space-y-2">
              <p className="font-semibold">{group.title}</p>
              <ul className="list-disc space-y-2 pl-6">
                {group.items.map((item, itemIndex) => (
                  <li key={`${blockKey}-group-${groupIndex}-item-${itemIndex}`}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
  }
}
