'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSearch } from '@/hooks/use-search';
import SearchBar from '@/components/shared/SearchBar/SearchBar';
import Link from 'next/link';
import { SearchResponse } from '@/services/api/search/search';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';
    
    const { results, loading, error, search, clearResults } = useSearch();
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (query) {
            search(query, activeTab);
        } else {
            clearResults();
        }
    }, [query, activeTab]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        if (query) {
            const params = new URLSearchParams(searchParams.toString());
            params.set('type', tab);
            router.push(`/search?${params.toString()}`);
        }
    };

    const handleSearch = (newQuery: string) => {
        if (newQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(newQuery)}&type=${activeTab}`);
        }
    };

    const searchData = results as SearchResponse;

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {query ? `Search results for "${query}"` : 'Search'}
                    </h1>
                    <div className="mb-6">
                        <SearchBar initialQuery={query} onSearch={handleSearch} />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b pb-2">
                    <button
                        className={`px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
                        onClick={() => handleTabChange('all')}
                    >
                        All {searchData && `(${searchData.total})`}
                    </button>
                    <button
                        className={`px-4 py-2 ${activeTab === 'users' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
                        onClick={() => handleTabChange('users')}
                    >
                        Users {searchData && `(${searchData.users_count})`}
                    </button>
                    <button
                        className={`px-4 py-2 ${activeTab === 'posts' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
                        onClick={() => handleTabChange('posts')}
                    >
                        Posts {searchData && `(${searchData.posts_count})`}
                    </button>
                    <button
                        className={`px-4 py-2 ${activeTab === 'tags' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
                        onClick={() => handleTabChange('tags')}
                    >
                        Tags {searchData && `(${searchData.tags_count})`}
                    </button>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
                        <p className="mt-4 text-gray-600">Searching...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-600">{error}</p>
                    </div>
                ) : !query ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">Enter a search term to find posts, users, or tags</p>
                    </div>
                ) : searchData && searchData.total === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No results found for "{query}"</p>
                    </div>
                ) : searchData ? (
                    <>
                        {/* Users */}
                        {(activeTab === 'all' || activeTab === 'users') && 
                         searchData.results.users.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold mb-4">Users</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {searchData.results.users.map((user) => (
                                        <Link
                                            key={user.id}
                                            href={`/profile/${user.id}`}
                                            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition"
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user.image || `https://ui-avatars.com/api/?name=${user.full_name}&background=8b5cf6&color=fff`}
                                                    alt={user.full_name}
                                                    className="w-12 h-12 rounded-full"
                                                />
                                                <div>
                                                    <h3 className="font-medium">{user.full_name}</h3>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                    {user.bio && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {user.bio.length > 60 ? user.bio.substring(0, 60) + '...' : user.bio}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Posts */}
                        {(activeTab === 'all' || activeTab === 'posts') && 
                         searchData.results.posts.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold mb-4">Posts</h2>
                                <div className="grid grid-cols-1 gap-4">
                                    {searchData.results.posts.map((post) => (
                                        <Link
                                            key={post.id}
                                            href={`/post/${post.id}`}
                                            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition"
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <img
                                                    src={post.user?.image || `https://ui-avatars.com/api/?name=${post.user?.full_name}&background=8b5cf6&color=fff`}
                                                    alt={post.user?.full_name}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                                <span className="font-medium">{post.user?.full_name}</span>
                                            </div>
                                            <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                                            <p className="text-gray-600 mb-3">
                                                {post.caption?.length > 150 ? post.caption.substring(0, 150) + '...' : post.caption}
                                            </p>
                                            {post.tags && post.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {post.tags.map((tag) => (
                                                        <span 
                                                            key={tag.id} 
                                                            className="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded"
                                                        >
                                                            #{tag.tag_name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {(activeTab === 'all' || activeTab === 'tags') && 
                         searchData.results.tags.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold mb-4">Tags</h2>
                                <div className="flex flex-wrap gap-3">
                                    {searchData.results.tags.map((tag) => (
                                        <Link
                                            key={tag.id}
                                            href={`/tags/${tag.id}`}
                                            className="bg-white rounded-lg shadow px-4 py-3 hover:shadow-md transition"
                                        >
                                            <span className="text-purple-600 font-medium">#{tag.tag_name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : null}
            </div>
        </div>
    );
}