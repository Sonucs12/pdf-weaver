import { Node } from "@tiptap/core";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";

export const OrderedListWithStart = Node.create({
  name: "orderedListWithStart",

  group: "block list",
  content: "listItem+",
  defining: true,

  addAttributes() {
    return {
      start: {
        default: 1,
        parseHTML: (element) =>
          parseInt(element.getAttribute("start") || "1", 10),
        renderHTML: (attributes) => {
          if (attributes.start === 1) return {};
          return { start: attributes.start };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "ol" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["ol", HTMLAttributes, 0];
  },

  addNodeView() {
    return ({ node }: { node: ProseMirrorNode }) => {
      const ol = document.createElement("ol");
      ol.start = (node.attrs?.start as number) || 1;

      const contentDOM = document.createElement("div");
      contentDOM.style.display = "contents";

      ol.appendChild(contentDOM);

      return { dom: ol, contentDOM };
    };
  },

  addCommands() {
    return {
      toggleOrderedList:
        () =>
        ({ commands }) => {
          return commands.toggleList(this.name, "listItem");
        },
    };
  },
});
