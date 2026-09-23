import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { PROJECT_STATUSES } from "@/lib/constants";
import { listProjects } from "@/server/queries";
import { ProjectGrid } from "@/components/lists";
import { FilterTabs, SearchBox } from "@/components/filters";
import { LinkButton, PageHeader } from "@/components/ui";
import { Plus } from "lucide-react";

export const metadata = { title: "Projects" };

export default async function ProjectsPage({ searchParams }: PageProps<"/projects">) {
  const user = await requireUser();
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "open";
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const projects = await listProjects(user, { status: status === "all" ? undefined : status, q });

  return (
    <>
      <PageHeader
        title="Projects"
        description={user.role === "client" ? "Your projects with us." : "All work in flight, by client."}
        actions={can(user, "projects.manage") && <LinkButton href="/projects/new"><Plus className="size-4" /> New project</LinkButton>}
      />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <FilterTabs
          current={status}
          options={[
            { value: "open", label: "Open" },
            ...PROJECT_STATUSES.map((s) => ({ value: s.value, label: s.label })),
            { value: "all", label: "All" },
          ]}
          hrefFor={(v) => `/projects?status=${v}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
        />
        <SearchBox defaultValue={q} placeholder="Search projects or clients…" hidden={{ status }} />
      </div>
      <ProjectGrid projects={projects} showClient={user.role !== "client"} />
    </>
  );
}
