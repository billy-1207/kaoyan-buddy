import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const mammoth = await import("mammoth");
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await mammoth.extractRawText({ buffer });

    const text = result.value;
    const extracted = parsePlanText(text);

    return NextResponse.json({ extracted });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Parse failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function parsePlanText(text: string) {
  const schoolMatch = text.match(/目标院校[：:]\s*(.+)/);
  const totalScoreMatch = text.match(/目标总分[：:]\s*(\d+)/);
  const periodMatch = text.match(/备考周期[：:]\s*(.+)/);

  const extracted: Record<string, unknown> = {
    targetSchool: schoolMatch?.[1]?.trim() || "",
    targetMajor: "人工智能专业",
    targetScore: totalScoreMatch ? parseInt(totalScoreMatch[1]) : 390,
    prepPeriod: periodMatch?.[1]?.trim() || "",
    subjects: [] as string[],
    phases: [] as string[],
  };

  // Extract phases from table data
  const phasePattern = /第[一二三四]阶段[：:]\s*([^\n]+)/g;
  let match;
  while ((match = phasePattern.exec(text)) !== null) {
    (extracted.phases as string[]).push(match[1].trim());
  }

  // Extract subject names
  const subjectPattern = /(数学|408|英语|政治)[^\n]*目标/g;
  while ((match = subjectPattern.exec(text)) !== null) {
    (extracted.subjects as string[]).push(match[0].trim());
  }

  return extracted;
}
