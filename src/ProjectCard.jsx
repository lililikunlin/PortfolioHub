import React, { useState, useEffect } from 'react';
import { Star, Heart, MessageSquare, Send } from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export default function ProjectCard({ item, user }) {
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  // Fetch Likes
  useEffect(() => {
    const q = query(collection(db, "likes"), where("itemId", "==", item.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLikes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [item.id]);

  // Fetch Comments
  useEffect(() => {
    const q = query(collection(db, "comments"), where("itemId", "==", item.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetchedComments.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setComments(fetchedComments);
    });
    return () => unsubscribe();
  }, [item.id]);

  const hasLiked = user ? likes.some(like => like.userId === user.uid) : false;

  const toggleLike = async () => {
    if (!user) return alert("請先登入 Google 帳號！");
    const likeId = `${user.uid}_${item.id}`;
    if (hasLiked) {
      await deleteDoc(doc(db, "likes", likeId));
    } else {
      await setDoc(doc(db, "likes", likeId), {
        userId: user.uid,
        itemId: item.id,
        createdAt: serverTimestamp()
      });
    }
  };

  const submitComment = async () => {
    if (!user) return alert("請先登入 Google 帳號！");
    if (rating === 0) return alert("請給予評分 (1-5 顆星)！");
    if (!newComment.trim()) return alert("請輸入留言內容！");

    await addDoc(collection(db, "comments"), {
      userId: user.uid,
      userName: user.displayName,
      userPhoto: user.photoURL,
      itemId: item.id,
      rating: rating,
      content: newComment,
      createdAt: serverTimestamp()
    });

    setNewComment("");
    setRating(0);
  };

  const avgRating = comments.length > 0 
    ? (comments.reduce((acc, curr) => acc + curr.rating, 0) / comments.length).toFixed(1) 
    : "0.0";

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      {item.link ? (
        <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'pointer', flex: 1 }}>
          {item.thumb && (
            <img src={item.thumb} alt={item.title} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px', border: '1px solid var(--card-border)' }} />
          )}
          <h3 style={{ color: 'var(--text-main)', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {item.icon} 
            {item.title}
            <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--neon-cyan)', textDecoration: 'none', border: '1px solid var(--neon-cyan)', padding: '4px 8px', borderRadius: '4px', transition: 'all 0.3s' }}>
              {item.btnText || '前往'}
            </span>
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 0 }}>{item.desc}</p>
        </a>
      ) : (
        <div style={{ flex: 1 }}>
          {item.thumb && (
            <img src={item.thumb} alt={item.title} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px', border: '1px solid var(--card-border)' }} />
          )}
          <h3 style={{ color: 'var(--text-main)', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {item.icon} {item.title}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: 0 }}>{item.desc}</p>
        </div>
      )}
      
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--card-border)', paddingTop: '15px' }}>
        <div style={{ display: 'flex', gap: '5px', color: '#ffb703', alignItems: 'center' }}>
          <Star size={18} fill="#ffb703" /> <span>{avgRating} ({comments.length})</span>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <span onClick={toggleLike} style={{ display: 'flex', gap: '5px', cursor: 'pointer', color: hasLiked ? '#ff5555' : 'var(--text-muted)', transition: 'color 0.2s' }}>
            <Heart size={18} fill={hasLiked ? '#ff5555' : 'none'} /> {likes.length}
          </span>
          <span onClick={() => setShowComments(!showComments)} style={{ display: 'flex', gap: '5px', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <MessageSquare size={18} /> {comments.length}
          </span>
        </div>
      </div>

      {showComments && (
        <div style={{ marginTop: '20px', borderTop: '1px solid var(--card-border)', paddingTop: '15px' }}>
          {/* Comment Form */}
          <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  size={24} 
                  fill={(hoverRating || rating) >= star ? "#ffb703" : "none"} 
                  color={(hoverRating || rating) >= star ? "#ffb703" : "var(--text-muted)"}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                value={newComment} 
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={user ? "留下您的評論..." : "請先登入以留言..."}
                disabled={!user}
                style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', background: 'transparent', color: 'var(--text-main)' }}
              />
              <button 
                onClick={submitComment}
                disabled={!user}
                style={{ padding: '10px 15px', borderRadius: '6px', border: 'none', background: 'var(--neon-purple)', color: '#fff', cursor: user ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center' }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>

          {/* Comment List */}
          <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {comments.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: '10px' }}>
                <img src={c.userPhoto || 'https://via.placeholder.com/32'} alt={c.userName} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{c.userName || '匿名'}</strong>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < c.rating ? "#ffb703" : "none"} color={i < c.rating ? "#ffb703" : "var(--text-muted)"} />
                      ))}
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, wordBreak: 'break-all' }}>{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
