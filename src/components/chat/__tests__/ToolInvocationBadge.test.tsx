import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

describe("ToolInvocationBadge", () => {
  describe("str_replace_editor tool", () => {
    test("displays 'Creating' message with file name", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "create", path: "/components/Button.tsx" }}
          state="result"
        />
      );

      expect(screen.getByText("Creating Button.tsx")).toBeDefined();
    });

    test("displays 'Editing' message with file name for str_replace command", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "str_replace", path: "/App.jsx" }}
          state="result"
        />
      );

      expect(screen.getByText("Editing App.jsx")).toBeDefined();
    });

    test("displays 'Viewing' message with file name", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "view", path: "/utils/helper.ts" }}
          state="result"
        />
      );

      expect(screen.getByText("Viewing helper.ts")).toBeDefined();
    });

    test("displays 'Inserting into' message with file name", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "insert", path: "/config.json" }}
          state="result"
        />
      );

      expect(screen.getByText("Inserting into config.json")).toBeDefined();
    });

    test("handles missing path gracefully", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "create" }}
          state="result"
        />
      );

      expect(screen.getByText("Creating file")).toBeDefined();
    });
  });

  describe("file_manager tool", () => {
    test("displays 'Renaming' message with both file names", () => {
      render(
        <ToolInvocationBadge
          toolName="file_manager"
          args={{
            command: "rename",
            path: "/old-name.tsx",
            new_path: "/new-name.tsx",
          }}
          state="result"
        />
      );

      expect(
        screen.getByText("Renaming old-name.tsx to new-name.tsx")
      ).toBeDefined();
    });

    test("displays 'Deleting' message with file name", () => {
      render(
        <ToolInvocationBadge
          toolName="file_manager"
          args={{ command: "delete", path: "/temp.js" }}
          state="result"
        />
      );

      expect(screen.getByText("Deleting temp.js")).toBeDefined();
    });

    test("handles missing path in rename command", () => {
      render(
        <ToolInvocationBadge
          toolName="file_manager"
          args={{ command: "rename" }}
          state="result"
        />
      );

      expect(screen.getByText("Renaming file")).toBeDefined();
    });
  });

  describe("visual states", () => {
    test("shows green dot when state is result", () => {
      const { container } = render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "create", path: "/test.tsx" }}
          state="result"
        />
      );

      const greenDot = container.querySelector(".bg-emerald-500");
      expect(greenDot).toBeDefined();
    });

    test("shows spinner when state is not result", () => {
      const { container } = render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "create", path: "/test.tsx" }}
          state="pending"
        />
      );

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeDefined();
    });
  });

  describe("file path handling", () => {
    test("extracts file name from nested path", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{
            command: "create",
            path: "/components/ui/buttons/PrimaryButton.tsx",
          }}
          state="result"
        />
      );

      expect(screen.getByText("Creating PrimaryButton.tsx")).toBeDefined();
    });

    test("handles path without leading slash", () => {
      render(
        <ToolInvocationBadge
          toolName="str_replace_editor"
          args={{ command: "create", path: "App.jsx" }}
          state="result"
        />
      );

      expect(screen.getByText("Creating App.jsx")).toBeDefined();
    });
  });

  describe("unknown tools", () => {
    test("displays tool name as fallback for unknown tools", () => {
      render(
        <ToolInvocationBadge
          toolName="unknown_tool"
          args={{}}
          state="result"
        />
      );

      expect(screen.getByText("unknown_tool")).toBeDefined();
    });
  });
});
