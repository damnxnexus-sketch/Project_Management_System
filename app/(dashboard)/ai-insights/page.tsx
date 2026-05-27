import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Sparkles, Brain, TrendingUp } from 'lucide-react';
import { AiInsightsDashboard } from '@/components/ai/AiInsightsDashboard';
import { AiTaskRecommender } from '@/components/ai/AiTaskRecommender';
import { ProjectHealthScore } from '@/components/ai/ProjectHealthScore';
import { TeamPerformanceSection } from '@/components/ai/TeamPerformanceSection';
import { generateProjectInsights, getTeamPerformanceInsights, calculateProjectHealthScore } from '@/actions/aiActions';

export default async function AiInsightsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Generate insights
  const insights = await generateProjectInsights();
  const teamPerformance = await getTeamPerformanceInsights();

  // Get projects for health scores
  const projects = await prisma.project.findMany({
    where: {
      status: 'active',
    },
  });

  // Calculate health scores for projects with metrics
  const projectHealthScores = await Promise.all(
    projects.slice(0, 3).map(async project => {
      const healthScore = await calculateProjectHealthScore(project.id);
      // Calculate actual metrics based on project data
      const tasks = await prisma.task.findMany({
        where: { projectId: project.id },
      });
      const completedCount = tasks.filter(t => t.status === 'done').length;
      const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
      const onTimeCount = tasks.filter(t => !t.dueDate || t.dueDate >= new Date()).length;
      const onTimeDelivery = tasks.length > 0 ? Math.round((onTimeCount / tasks.length) * 100) : 0;
      const highRiskCount = tasks.filter(t => t.aiRisk).length;
      const riskLevel: 'low' | 'medium' | 'high' = highRiskCount > tasks.length * 0.5 ? 'high' : highRiskCount > tasks.length * 0.25 ? 'medium' : 'low';
      
      return {
        project,
        healthScore,
        metrics: {
          completionRate,
          onTimeDelivery,
          riskLevel,
        }
      };
    })
  );

  // Mock recommendations (in production, these would come from Claude)
  const recommendations = [
    {
      id: '1',
      category: 'optimization' as const,
      title: 'Break Down Large Tasks',
      description: 'Several tasks exceed 200 lines of description. Consider splitting them.',
      actionItems: [
        'Identify large tasks in backlog',
        'Create subtasks for complex items',
        'Update task dependencies',
      ],
      estimatedImpact: 'high' as const,
    },
    {
      id: '2',
      category: 'efficiency' as const,
      title: 'Parallel Task Execution',
      description: 'Some tasks can be done simultaneously instead of sequentially.',
      actionItems: [
        'Review task dependencies',
        'Identify independent tasks',
        'Assign to available team members',
      ],
      estimatedImpact: 'medium' as const,
    },
    {
      id: '3',
      category: 'quality' as const,
      title: 'Code Review Process',
      description: 'Implement structured code reviews for critical tasks.',
      actionItems: [
        'Define review criteria',
        'Assign reviewers',
        'Schedule review meetings',
      ],
      estimatedImpact: 'high' as const,
    },
  ];

  // Convert insights to the format expected by the dashboard
  const dashboardInsights = insights.map(insight => ({
    id: insight.id,
    title: insight.title,
    description: insight.description,
    icon: (
      <Sparkles size={16} />
    ),
    priority: insight.priority,
    color: insight.priority === 'high' ? 'red' : insight.priority === 'medium' ? 'yellow' : 'green',
    actionText: insight.actionText,
  }));

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-accent to-accent/70">
            <Brain size={20} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">AI Insights & Intelligence</h1>
        </div>
        <p className="text-muted text-lg">
          Powered by advanced AI to help optimize your project management
        </p>
      </div>

      {/* Main Insights */}
      <div>
        <AiInsightsDashboard 
          insights={dashboardInsights}
          isLoading={false}
        />
      </div>

      {/* Project Health Scores */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={24} className="text-accent" />
          <h2 className="text-xl font-semibold text-foreground">Project Health</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projectHealthScores.map(({ project, healthScore, metrics }) => (
            <ProjectHealthScore
              key={project.id}
              projectName={project.name}
              healthScore={healthScore}
              metrics={{
                completionRate: metrics.completionRate,
                riskLevel: metrics.riskLevel,
                onTimeDelivery: metrics.onTimeDelivery,
                teamProductivity: Math.round((metrics.completionRate + metrics.onTimeDelivery) / 2),
              }}
            />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Sparkles size={24} className="text-accent" />
          <h2 className="text-xl font-semibold text-foreground">Smart Recommendations</h2>
        </div>
        
        <AiTaskRecommender 
          recommendations={recommendations}
          isLoading={false}
        />
      </div>

      {/* Team Performance */}
      {teamPerformance && (
        <TeamPerformanceSection teamPerformance={teamPerformance} />
      )}

      {/* Footer Info */}
      <div className="rounded-xl border border-border bg-surface/50 p-6 text-center text-sm text-muted">
        <p>
          💡 <strong>Pro Tip:</strong> These insights are updated in real-time as your team progresses on tasks.
        </p>
      </div>
    </div>
  );
}
