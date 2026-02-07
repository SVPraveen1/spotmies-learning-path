import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as d3 from "d3";
import api from "../services/api";
import {
  Download,
  RefreshCw,
  CheckCircle,
  Circle,
  PlayCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Map,
  Sparkles,
  FileDown,
  ArrowRight,
  BookOpen,
} from "lucide-react";

const LearningPath = () => {
  const navigate = useNavigate();
  const svgRef = useRef(null);
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [viewMode, setViewMode] = useState("dag"); // 'dag' or 'list'

  useEffect(() => {
    fetchLearningPath();
  }, []);

  useEffect(() => {
    if (learningPath && viewMode === "dag") {
      renderDAG();
    }
  }, [learningPath, viewMode]);

  const fetchLearningPath = async () => {
    try {
      const response = await api.get("/recommendations/path");
      setLearningPath(response.data);
    } catch (error) {
      console.error("Error fetching path:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (topicIndex, status) => {
    setUpdating(topicIndex);
    try {
      await api.put(`/recommendations/progress/${topicIndex}`, { status });
      await fetchLearningPath();
    } catch (error) {
      console.error("Error updating progress:", error);
    } finally {
      setUpdating(null);
    }
  };

  const exportPDF = async () => {
    try {
      const response = await api.get("/export/pdf", {
        responseType: "blob",
      });

      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "learning-path.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. Please try again.");
    }
  };

  const regeneratePath = async () => {
    if (!confirm("This will reset your current progress. Continue?")) return;
    setLoading(true);
    try {
      await api.post("/recommendations/generate");
      await fetchLearningPath();
    } catch (error) {
      console.error("Error regenerating:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderDAG = () => {
    if (!svgRef.current || !learningPath?.topics) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Use container dimensions or default
    const width = svgRef.current.clientWidth || 800;
    const height = 600;
    const nodeWidth = 200;
    const nodeHeight = 70;
    const verticalGap = 120;
    const horizontalGap = 250;

    const topics = learningPath.topics;

    // Calculate positions - responsive grid or hierarchy
    const nodesPerRow = Math.max(1, Math.floor(width / (horizontalGap + 20)));
    const nodes = topics.map((topic, index) => {
      const row = Math.floor(index / nodesPerRow);
      const col = index % nodesPerRow;

      // Snake layout for better flow
      const isEvenRow = row % 2 === 0;
      const actualCol = isEvenRow ? col : nodesPerRow - 1 - col;

      const offsetX = (width - (nodesPerRow - 1) * horizontalGap) / 2;

      return {
        ...topic,
        index,
        x: offsetX + actualCol * horizontalGap,
        y: 100 + row * verticalGap,
      };
    });

    // Create links (connect sequential topics)
    const links = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      links.push({
        source: nodes[i],
        target: nodes[i + 1],
      });
    }

    // SVG group with zoom
    const mainGroup = svg.append("g");

    // Define Arrow Marker
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", nodeWidth / 2 + 10)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#94a3b8");

    // Draw links
    mainGroup
      .selectAll(".link")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "dag-link")
      .attr("d", (d) => {
        const sourceX = d.source.x;
        const sourceY = d.source.y;
        const targetX = d.target.x;
        const targetY = d.target.y;

        // Curved text
        return `M ${sourceX} ${sourceY + nodeHeight / 2} 
                C ${sourceX} ${(sourceY + targetY) / 2},
                  ${targetX} ${(sourceY + targetY) / 2},
                  ${targetX} ${targetY - nodeHeight / 2}`;
      })
      .style("stroke", "#cbd5e1")
      .style("stroke-width", 2)
      .style("fill", "none")
      .style("opacity", 0.6)
      .attr("marker-end", "url(#arrow)");

    // Draw nodes
    const nodeGroups = mainGroup
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "dag-node")
      .attr(
        "transform",
        (d) => `translate(${d.x - nodeWidth / 2}, ${d.y - nodeHeight / 2})`,
      )
      .style("cursor", "pointer")
      .on("click", (event, d) =>
        setSelectedTopic(selectedTopic?.index === d.index ? null : d),
      );

    // Node Drop Shadow Filter
    const defs = svg.append("defs");
    const filter = defs
      .append("filter")
      .attr("id", "drop-shadow")
      .attr("height", "130%");
    filter
      .append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 3)
      .attr("result", "blur");
    filter
      .append("feOffset")
      .attr("in", "blur")
      .attr("dx", 0)
      .attr("dy", 4)
      .attr("result", "offsetBlur");
    filter
      .append("feMerge")
      .append("feMergeNode")
      .attr("in", "offsetBlur")
      .select(function () {
        return this.parentNode;
      })
      .append("feMergeNode")
      .attr("in", "SourceGraphic");

    // Node rectangles
    nodeGroups
      .append("rect")
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("rx", 16)
      .attr("ry", 16)
      .style("fill", "#ffffff")
      .style("filter", "url(#drop-shadow)")
      .style("stroke", (d) => {
        if (d.status === "completed") return "#10b981";
        if (d.status === "in_progress") return "#f59e0b";
        return "#e2e8f0";
      })
      .style("stroke-width", (d) => (d.status === "not_started" ? 1 : 2));

    // Status Indicator Circle
    nodeGroups
      .append("circle")
      .attr("cx", 24)
      .attr("cy", nodeHeight / 2)
      .attr("r", 10)
      .style("fill", (d) => {
        if (d.status === "completed") return "#10b981";
        if (d.status === "in_progress") return "#f59e0b";
        return "#f1f5f9";
      })
      .style("stroke", "none");

    // Status Icon inside circle
    nodeGroups
      .append("text")
      .attr("x", 24)
      .attr("y", nodeHeight / 2 + 4)
      .attr("text-anchor", "middle")
      .style("font-family", "Arial")
      .style("font-size", "10px")
      .style("fill", (d) =>
        d.status === "not_started" ? "#94a3b8" : "#ffffff",
      )
      .text((d) => {
        if (d.status === "completed") return "✓";
        if (d.status === "in_progress") return "▶";
        return "";
      });

    // Node title
    nodeGroups
      .append("text")
      .attr("x", 48)
      .attr("y", nodeHeight / 2 - 8)
      .style("font-size", "13px")
      .style("font-weight", "600")
      .style("font-family", "Inter, sans-serif")
      .style("fill", "#1e293b")
      .text((d) =>
        d.title.length > 22 ? d.title.substring(0, 22) + "..." : d.title,
      );

    // Difficulty badge text
    nodeGroups
      .append("text")
      .attr("x", 48)
      .attr("y", nodeHeight / 2 + 14)
      .style("font-size", "11px")
      .style("font-family", "Inter, sans-serif")
      .style("fill", "#64748b")
      .text((d) => `${d.difficulty} • ${d.resources?.length || 0} resources`);

    // Add zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 2])
      .on("zoom", (event) => {
        mainGroup.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Initial Center
    const initialTransform = d3.zoomIdentity
      .translate(width / 2 - nodes[0].x, 20)
      .scale(0.9);
    svg.call(zoom.transform, initialTransform);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={20} className="text-success" />;
      case "in_progress":
        return <PlayCircle size={20} className="text-warning" />;
      default:
        return <Circle size={20} className="text-muted" />;
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case "not_started":
        return "in_progress";
      case "in_progress":
        return "completed";
      case "completed":
        return "not_started";
      default:
        return "not_started";
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your learning path...</p>
      </div>
    );
  }

  if (!learningPath) {
    return (
      <div className="learning-path-container">
        <div className="empty-state">
          <div className="empty-icon">
            <Map size={40} />
          </div>
          <h2 className="empty-title">No Learning Path Yet</h2>
          <p className="empty-desc">
            Complete a skill assessment first, then generate your personalized
            learning path.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-primary btn-lg"
          >
            <Sparkles size={20} />
            Take an Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-path-container">
      {/* Header */}
      <div className="path-header">
        <div>
          <h1
            className="path-title"
            style={{
              fontSize: "2rem",
              fontWeight: "700",
              marginBottom: "0.5rem",
            }}
          >
            Your Learning Roadmap
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Follow this personalized path to master new skills
          </p>
        </div>
        <div className="path-actions">
          <button onClick={exportPDF} className="btn btn-secondary">
            <FileDown size={18} />
            Export PDF
          </button>
          <button onClick={regeneratePath} className="btn btn-secondary">
            <RefreshCw size={18} />
            Regenerate
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="path-progress">
        <div className="progress-stats">
          <div className="progress-stat">
            <p className="progress-stat-value">
              {learningPath.progressPercentage}%
            </p>
            <p className="progress-stat-label">Complete</p>
          </div>
          <div className="progress-stat">
            <p className="progress-stat-value">
              {learningPath.completedTopics}
            </p>
            <p className="progress-stat-label">Topics Done</p>
          </div>
          <div className="progress-stat">
            <p className="progress-stat-value">
              {learningPath.totalTopics - learningPath.completedTopics}
            </p>
            <p className="progress-stat-label">Remaining</p>
          </div>
        </div>
        <div
          className="progress-bar"
          style={{ marginTop: "1.5rem", height: "12px" }}
        >
          <div
            className="progress-fill"
            style={{ width: `${learningPath.progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* View Toggle */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          className={`btn ${viewMode === "dag" ? "btn-primary" : "btn-secondary"} btn-sm`}
          onClick={() => setViewMode("dag")}
        >
          <Map size={16} />
          Roadmap View
        </button>
        <button
          className={`btn ${viewMode === "list" ? "btn-primary" : "btn-secondary"} btn-sm`}
          onClick={() => setViewMode("list")}
        >
          List View
        </button>
      </div>

      {/* DAG Visualization */}
      {viewMode === "dag" && (
        <div className="dag-container">
          <svg
            ref={svgRef}
            className="dag-svg"
            style={{ width: "100%", height: "100%" }}
          ></svg>
          <div
            style={{
              position: "absolute",
              bottom: "1rem",
              right: "1rem",
              background: "rgba(255,255,255,0.9)",
              padding: "0.5rem",
              borderRadius: "8px",
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              pointerEvents: "none",
            }}
          >
            Scroll to zoom • Click nodes for details
          </div>
        </div>
      )}

      {/* Selected Topic Details */}
      {selectedTopic && (
        <div
          className="card"
          style={{
            marginTop: "1.5rem",
            padding: "2rem",
            border: "1px solid var(--primary-light)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div className="card-header" style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {getStatusIcon(selectedTopic.status)}
              <h3 className="card-title" style={{ fontSize: "1.5rem" }}>
                {selectedTopic.title}
              </h3>
            </div>
            <span className={`badge badge-${selectedTopic.difficulty}`}>
              {selectedTopic.difficulty}
            </span>
          </div>
          <p
            style={{
              color: "var(--text-secondary)",
              marginBottom: "1.5rem",
              lineHeight: "1.6",
            }}
          >
            {selectedTopic.description}
          </p>

          {selectedTopic.resources && selectedTopic.resources.length > 0 && (
            <>
              <h4
                style={{
                  marginBottom: "1rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <BookOpen size={18} />
                Learning Resources
              </h4>
              <div
                style={{
                  display: "grid",
                  gap: "0.75rem",
                }}
              >
                {selectedTopic.resources.map((resource, index) => (
                  <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resource-link"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "1rem",
                      background: "var(--surface)",
                      borderRadius: "var(--radius)",
                      textDecoration: "none",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-color)",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = "var(--primary)";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-color)";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    <div
                      style={{
                        padding: "0.5rem",
                        background: "rgba(99, 71, 235, 0.1)",
                        borderRadius: "8px",
                        color: "var(--primary)",
                      }}
                    >
                      <ExternalLink size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: "500", display: "block" }}>
                        {resource.title}
                      </span>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {resource.type}
                      </span>
                    </div>
                    <ArrowRight size={16} color="var(--text-muted)" />
                  </a>
                ))}
              </div>
            </>
          )}

          <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
            <button
              onClick={() =>
                updateProgress(
                  selectedTopic.index,
                  getNextStatus(selectedTopic.status),
                )
              }
              className={`btn ${selectedTopic.status === "completed" ? "btn-secondary" : "btn-primary"} btn-lg`}
              disabled={updating === selectedTopic.index}
            >
              {updating === selectedTopic.index
                ? "Updating..."
                : selectedTopic.status === "not_started"
                  ? "Start Learning"
                  : selectedTopic.status === "in_progress"
                    ? "Mark as Completed"
                    : "Mark as Incomplete"}
            </button>
            <button
              onClick={() => setSelectedTopic(null)}
              className="btn btn-ghost"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* Topics List */}
      {viewMode === "list" && (
        <div className="topics-list" style={{ marginTop: "2rem" }}>
          {learningPath.topics.map((topic, index) => (
            <div key={index} className="topic-card">
              <div
                className={`topic-status ${topic.status}`}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  updateProgress(index, getNextStatus(topic.status))
                }
              >
                {updating === index ? (
                  <RefreshCw size={16} className="spin" />
                ) : topic.status === "completed" ? (
                  <CheckCircle size={16} />
                ) : topic.status === "in_progress" ? (
                  <PlayCircle size={16} />
                ) : (
                  <Circle size={16} />
                )}
              </div>
              <div className="topic-content">
                <h4 className="topic-title">{topic.title}</h4>
                <p className="topic-desc">{topic.description}</p>
                <div className="topic-meta">
                  <span className={`badge badge-${topic.difficulty}`}>
                    {topic.difficulty}
                  </span>
                  {topic.resources && (
                    <span>{topic.resources.length} resources</span>
                  )}
                </div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() =>
                  setSelectedTopic(
                    selectedTopic?.index === index ? null : { ...topic, index },
                  )
                }
              >
                {selectedTopic?.index === index ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LearningPath;
