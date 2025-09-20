import heapq

class Graph:
    def __init__(self):
        self.edges = {}  # {node: [(neighbor, weight), ...]}

    def add_edge(self, u, v, w=1):
        self.edges.setdefault(u, []).append((v, w))
        self.edges.setdefault(v, []).append((u, w))

    def dijkstra(self, start, end):
        heap = [(0, start, [])]
        visited = set()
        while heap:
            cost, node, path = heapq.heappop(heap)
            if node in visited: continue
            visited.add(node)
            path = path + [node]
            if node == end:
                return path, cost
            for neighbor, w in self.edges.get(node, []):
                if neighbor not in visited:
                    heapq.heappush(heap, (cost + w, neighbor, path))
        return [], float('inf')
