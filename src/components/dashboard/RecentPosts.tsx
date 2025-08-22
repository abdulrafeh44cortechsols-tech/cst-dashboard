import React from 'react';
import { Eye, MessageCircle, Calendar, Edit } from 'lucide-react';

const RecentPosts: React.FC = () => {
  const posts = [
    {
      id: 1,
      title: 'Getting Started with React Hooks',
      status: 'Published',
      date: '2024-01-15',
      views: 1250,
      comments: 8,
      author: 'John Doe'
    },
    {
      id: 2,
      title: 'Web Design Trends for 2024',
      status: 'Draft',
      date: '2024-01-14',
      views: 0,
      comments: 0,
      author: 'Sarah Wilson'
    },
    {
      id: 3,
      title: 'Ultimate CSS Grid Guide',
      status: 'Published',
      date: '2024-01-13',
      views: 890,
      comments: 12,
      author: 'Mike Johnson'
    },
    {
      id: 4,
      title: 'JavaScript ES2024 Features',
      status: 'Scheduled',
      date: '2024-01-20',
      views: 0,
      comments: 0,
      author: 'John Doe'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">{post.title}</h4>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                  {post.status}
                </span>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{post.views}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>{post.comments}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">by {post.author}</p>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      <div className="text-center pt-4">
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          View All Posts
        </button>
      </div>
    </div>
  );
};

export default RecentPosts;