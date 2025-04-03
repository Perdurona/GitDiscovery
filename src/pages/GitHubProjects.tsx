import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  FolderSync, 
  Save,
  GitFork,
  Star,
  Eye,
  Activity,
  Clock,
  Code,
  GitBranch as Branch,
  GitCommit,
  Users,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Tag,
  Book,
  Globe,
  Zap
} from 'lucide-react';
import CategoryDialog from '../components/CategoryDialog';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import GitHubDiscovery from '../components/GitHubDiscovery';
import UnifiedProjectView from '../components/UnifiedProjectView';
import { v4 as uuidv4 } from 'uuid';
import { getProjects, setProjects, getCategories, setCategories } from '../utils/store';
import { GitHubRepo, getRepoDetails } from '../utils/github';

type Category = {
  id: string;
  name: string;
  color: string;
};

type Project = {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  logo?: string;
  owner: string;
  stats: {
    stars: number;
    forks: number;
    watchers: number;
    issues: number;
  };
  lastActivity: string;
  contributors: number;
  branches: number;
  commits: number;
  pullRequests: number;
  categories: Category[];
  languages: { name: string; percentage: number }[];
  topics: string[];
  license?: string;
  size?: number;
  lastRelease?: {
    name: string;
    published_at: string;
    url: string;
  };
  homepage?: string;
};

export default function GitHubProjects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [projects, setProjectsState] = useState<Project[]>(getProjects() || []);
  const [globalCategories, setGlobalCategories] = useState<Category[]>(
    getCategories() || []
  );
  const [isDiscoveryMode, setIsDiscoveryMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setProjects(projects);
  }, [projects]);

  useEffect(() => {
    setCategories(globalCategories);
  }, [globalCategories]);

  const addProject = (project: Project) => {
    setProjectsState(prev => [...prev, project]);
  };

  const removeProject = (id: string) => {
    setProjectsState(prev => prev.filter(p => p.id !== id));
  };

  const addCategory = (category: Category) => {
    if (selectedProject) {
      const updatedProjects = projects.map(project => {
        if (project.id === selectedProject.id) {
          return {
            ...project,
            categories: [...(project.categories || []), category]
          };
        }
        return project;
      });
      setProjectsState(updatedProjects);
      setSelectedProject({
        ...selectedProject,
        categories: [...(selectedProject.categories || []), category]
      });
      
      if (!globalCategories.find(c => c.name === category.name)) {
        setGlobalCategories([...globalCategories, category]);
      }
    }
  };

  const removeCategory = (categoryId: string) => {
    if (selectedProject) {
      const updatedProjects = projects.map(project => {
        if (project.id === selectedProject.id) {
          return {
            ...project,
            categories: (project.categories || []).filter(c => c.id !== categoryId)
          };
        }
        return project;
      });
      setProjects(updatedProjects);
      setSelectedProject({
        ...selectedProject,
        categories: (selectedProject.categories || []).filter(c => c.id !== categoryId)
      });
    }
  };

  const toggleCategoryFilter = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
                         project.description.toLowerCase().includes(projectSearch.toLowerCase());
    
    const matchesCategories = selectedCategories.length === 0 ||
                             selectedCategories.every(catId => 
                               project.categories?.some(c => c.id === catId)
                             );
    
    return matchesSearch && matchesCategories;
  });

  const ProjectCard = ({ project }: { project: Project }) => (
    <div className="project-card group" onClick={() => setSelectedProject(project)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {project.logo && (
            <img 
              src={project.logo} 
              alt={`${project.name} logo`} 
              className="w-8 h-8 rounded-lg object-cover"
            />
          )}
          <div>
            <h3 className="text-lg font-semibold flex items-center space-x-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent group-hover:from-indigo-300 group-hover:to-purple-300 transition-all duration-300">
              <span>{project.name}</span>
              <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform duration-300" />
            </h3>
            <div className="text-xs text-gray-500">by {project.owner}</div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="card-action-button">
            <Save className="w-5 h-5 text-indigo-400" />
          </button>
          <button className="card-action-button">
            <FolderSync className="w-5 h-5 text-purple-400" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              removeProject(project.id);
            }}
            className="card-action-button hover:bg-red-600/20"
          >
            <Trash2 className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>
      <p className="text-gray-400 mt-2 line-clamp-2">{project.description}</p>
      
      <div className="flex flex-wrap gap-2 mt-3">
        {project.topics?.slice(0, 3).map((topic, index) => (
          <span
            key={index}
            className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30"
          >
            {topic}
          </span>
        ))}
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="flex items-center space-x-1 text-sm text-gray-400">
          <Star className="w-4 h-4 text-yellow-400" />
          <span>{project.stats.stars.toLocaleString()}</span>
        </div>
        <div className="flex items-center space-x-1 text-sm text-gray-400">
          <GitFork className="w-4 h-4 text-blue-400" />
          <span>{project.stats.forks.toLocaleString()}</span>
        </div>
        <div className="flex items-center space-x-1 text-sm text-gray-400">
          <Eye className="w-4 h-4 text-green-400" />
          <span>{project.stats.watchers.toLocaleString()}</span>
        </div>
        <div className="flex items-center space-x-1 text-sm text-gray-400">
          <GitCommit className="w-4 h-4 text-purple-400" />
          <span>{project.commits.toLocaleString()}</span>
        </div>
      </div>
      
      {project.languages.length > 0 && (
        <div className="mt-3">
          <div className="flex h-2 rounded-full overflow-hidden">
            {project.languages.slice(0, 5).map((lang, index) => (
              <div
                key={index}
                className="h-full"
                style={{
                  width: `${lang.percentage}%`,
                  backgroundColor: getLanguageColor(lang.name)
                }}
                title={`${lang.name}: ${lang.percentage}%`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>{project.languages[0]?.name}</span>
            {project.languages.length > 1 && (
              <span>+{project.languages.length - 1} more</span>
            )}
          </div>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 mt-3">
        {project.categories?.map((category) => (
          <span
            key={category.id}
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${category.color}20`,
              color: category.color,
              border: `1px solid ${category.color}40`
            }}
          >
            {category.name}
          </span>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-gray-500 flex justify-between">
        <span>Updated: {new Date(project.lastActivity).toLocaleDateString()}</span>
        {project.license && <span>{project.license}</span>}
      </div>
    </div>
  );

  const getLanguageColor = (language: string): string => {
    const colors: Record<string, string> = {
      JavaScript: '#f1e05a',
      TypeScript: '#3178c6',
      Python: '#3572A5',
      Java: '#b07219',
      Go: '#00ADD8',
      Rust: '#dea584',
      'C++': '#f34b7d',
      PHP: '#4F5D95',
      Ruby: '#701516',
      HTML: '#e34c26',
      CSS: '#563d7c',
      Shell: '#89e051',
      Swift: '#ffac45',
      Kotlin: '#A97BFF',
      Dart: '#00B4AB',
      C: '#555555',
      'C#': '#178600'
    };
    
    return colors[language] || '#8257e5'; // Default purple color
  };

  const handleSelectRepo = async (repo: GitHubRepo) => {
    setIsLoading(true);
    
    try {
      const [owner, repoName] = repo.full_name.split('/');
      
      const details = await getRepoDetails(owner, repoName);
      
      const totalBytes = Object.values(details.languages).reduce((sum, bytes) => sum + bytes, 0);
      const languages = Object.entries(details.languages).map(([name, bytes]) => ({
        name,
        percentage: Math.round((bytes / totalBytes) * 100)
      })).sort((a, b) => b.percentage - a.percentage);
      
      const project = {
        id: repo.id.toString(),
        name: repo.name,
        description: repo.description || '',
        category: '',
        url: repo.html_url,
        logo: repo.owner.avatar_url,
        owner: repo.owner.login,
        stats: {
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          watchers: repo.watchers_count,
          issues: repo.open_issues_count
        },
        lastActivity: repo.updated_at,
        contributors: details.contributors,
        branches: details.branches,
        commits: details.commits,
        pullRequests: details.pullRequests,
        categories: [],
        languages: languages,
        topics: details.topics || [],
        license: repo.license?.name,
        size: repo.size,
        lastRelease: details.lastRelease ? {
          name: details.lastRelease.name,
          published_at: details.lastRelease.published_at,
          url: details.lastRelease.html_url
        } : undefined,
        homepage: repo.homepage
      };

      addProject(project);
      setIsDiscoveryMode(false); // Return to saved projects after adding
    } catch (error) {
      console.error('Error adding project:', error);
      
      // Fallback project creation logic...
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDiscoveryMode = () => {
    setIsDiscoveryMode(!isDiscoveryMode);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          GitHub Projects
        </h1>
        <div className="flex space-x-4">
          {!isDiscoveryMode ? (
            <>
              <SearchBar
                placeholder="Search local projects..."
                value={projectSearch}
                onChange={setProjectSearch}
              />
              <button 
                className={`transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-lg ${
                  isDiscoveryMode
                    ? 'bg-green-600/20 text-green-400 border border-green-500/40 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                    : 'btn-secondary'
                }`}
                onClick={toggleDiscoveryMode}
              >
                <Globe className={`w-5 h-5 ${isDiscoveryMode ? 'text-green-400' : ''}`} />
                <span>Discover Projects</span>
                {isDiscoveryMode && <Zap className="w-4 h-4 text-green-400 animate-pulse" />}
              </button>
            </>
          ) : (
            <button 
              className={`transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600/20 text-green-400 border border-green-500/40 shadow-[0_0_10px_rgba(34,197,94,0.2)]`}
              onClick={toggleDiscoveryMode}
            >
              <Star className="w-5 h-5 text-green-400" />
              <span>View Saved Projects</span>
              <Zap className="w-4 h-4 text-green-400 animate-pulse" />
            </button>
          )}
        </div>
      </div>

      {!selectedProject ? (
        isDiscoveryMode ? (
          // Discovery Mode
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-400" />
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Discover GitHub Projects
              </span>
            </h2>
            <div className="max-h-[calc(100vh-20rem)] overflow-y-auto">
              <GitHubDiscovery 
                onSelectRepo={handleSelectRepo}
                currentRepo={null}
                containerClassName="max-h-full"
              />
            </div>
          </div>
        ) : (
          // Saved Projects Mode
          <>
            <CategoryFilter
              categories={globalCategories}
              selectedCategories={selectedCategories}
              onSelectCategory={toggleCategoryFilter}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
              
              {/* Add discovery suggestion card if no projects match filter */}
              {filteredProjects.length === 0 && (
                <div 
                  className="glass-card p-5 rounded-xl space-y-3 cursor-pointer 
                    hover:scale-[1.02] transition-all duration-300 flex flex-col 
                    items-center justify-center border-dashed border-2 border-gray-700/50
                    hover:border-green-500/50 hover:bg-green-900/10 h-[320px]"
                  onClick={toggleDiscoveryMode}
                >
                  <Globe className="w-16 h-16 text-gray-500" />
                  <h3 className="text-xl font-medium text-center text-gray-400">Discover New Projects</h3>
                  <p className="text-sm text-gray-500 text-center max-w-[200px]">
                    Find and add popular GitHub projects to your collection
                  </p>
                  <button 
                    className="mt-4 px-3 py-1.5 rounded-lg bg-green-600/20 text-green-400 
                      border border-green-500/40 flex items-center gap-2"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Explore</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )
      ) : (
        <UnifiedProjectView 
          project={selectedProject} 
          onBack={() => setSelectedProject(null)}
          onCategoryDialogOpen={() => setIsCategoryDialogOpen(true)}
          onRemoveProject={removeProject}
        />
      )}

      {selectedProject && (
        <CategoryDialog
          isOpen={isCategoryDialogOpen}
          onClose={() => setIsCategoryDialogOpen(false)}
          onAddCategory={addCategory}
          onRemoveCategory={removeCategory}
          categories={selectedProject.categories || []}
          projectId={selectedProject.id}
        />
      )}
    </div>
  );
} 