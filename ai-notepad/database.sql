-- ================================================
-- AI记事本项目 - MySQL数据库初始化脚本
-- 版本: 1.0
-- 日期: 2026-06-10
-- ================================================

-- 设置客户端字符集（解决中文乱码问题）
SET NAMES utf8mb4;
SET character_set_client = utf8mb4;
SET character_set_results = utf8mb4;
SET character_set_connection = utf8mb4;

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS ai_notepad 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE ai_notepad;

-- 设置会话字符集
SET SESSION character_set_connection = utf8mb4;
SET SESSION character_set_client = utf8mb4;
SET SESSION character_set_results = utf8mb4;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱地址',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    avatar VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
    nickname VARCHAR(50) DEFAULT NULL COMMENT '昵称',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_users_email (email),
    INDEX idx_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 笔记表
CREATE TABLE IF NOT EXISTS notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '笔记ID',
    user_id BIGINT NOT NULL COMMENT '所属用户ID',
    title VARCHAR(255) NOT NULL COMMENT '笔记标题',
    content LONGTEXT COMMENT '笔记内容',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_notes_user_id (user_id),
    INDEX idx_notes_created_at (created_at),
    CONSTRAINT fk_notes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='笔记表';

-- 笔记图片表
CREATE TABLE IF NOT EXISTS note_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '图片ID',
    note_id BIGINT NOT NULL COMMENT '所属笔记ID',
    image_url VARCHAR(500) NOT NULL COMMENT '图片URL',
    file_name VARCHAR(255) COMMENT '原始文件名',
    file_size INT COMMENT '文件大小',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    INDEX idx_note_images_note_id (note_id),
    CONSTRAINT fk_note_images_note FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='笔记图片表';

-- 日程表
CREATE TABLE IF NOT EXISTS schedules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日程ID',
    user_id BIGINT NOT NULL COMMENT '所属用户ID',
    title VARCHAR(255) NOT NULL COMMENT '日程标题',
    description TEXT COMMENT '备注说明',
    date DATE NOT NULL COMMENT '日程日期',
    time TIME DEFAULT '09:00:00' COMMENT '日程时间',
    status ENUM('pending', 'in-progress', 'completed') DEFAULT 'pending' COMMENT '状态',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_schedules_user_id (user_id),
    INDEX idx_schedules_date (date),
    INDEX idx_schedules_status (status),
    CONSTRAINT fk_schedules_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日程表';

-- 知识库表
CREATE TABLE IF NOT EXISTS knowledge_base (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '知识库ID',
    user_id BIGINT NOT NULL COMMENT '所属用户ID',
    title VARCHAR(255) NOT NULL COMMENT '知识标题',
    content LONGTEXT NOT NULL COMMENT '知识内容',
    source VARCHAR(255) COMMENT '来源链接',
    category VARCHAR(50) DEFAULT 'default' COMMENT '分类标签',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_knowledge_user_id (user_id),
    INDEX idx_knowledge_category (category),
    CONSTRAINT fk_knowledge_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识库表';

-- 聊天记录表
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '消息ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    conversation_id VARCHAR(36) NOT NULL COMMENT '对话ID',
    role ENUM('user', 'assistant') NOT NULL COMMENT '角色',
    content TEXT NOT NULL COMMENT '消息内容',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
    INDEX idx_chat_user_id (user_id),
    INDEX idx_chat_conversation_id (conversation_id),
    INDEX idx_chat_created_at (created_at),
    CONSTRAINT fk_chat_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='聊天记录表';

-- 插入示例数据
INSERT INTO users (username, email, password, nickname) VALUES 
('admin', 'admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', '管理员');

INSERT INTO notes (user_id, title, content) VALUES 
(1, '欢迎使用AI记事本', '这是您的第一篇笔记'),
(1, '会议记录模板', '会议主题');

INSERT INTO schedules (user_id, title, description, date, time, status) VALUES 
(1, '团队周会', '讨论工作进展', '2026-06-12', '10:00:00', 'pending');

INSERT INTO knowledge_base (user_id, title, content, category) VALUES 
(1, '快捷键指南', 'Ctrl+S保存', '操作指南');

SELECT '数据库初始化完成！' AS result;