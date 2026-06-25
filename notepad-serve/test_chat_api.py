# -*- coding: utf-8 -*-
"""
测试智能问答API
"""
import requests
import time

def test_chat_api():
    """测试智能问答API"""
    print("=" * 60)
    print("测试智能问答API")
    print("=" * 60)
    
    # 测试1: 简单问题
    print("\n1. 测试简单问题...")
    start_time = time.time()
    
    try:
        response = requests.post(
            "http://localhost:8000/api/chat/",
            json={"question": "你好"},
            timeout=60
        )
        
        elapsed_time = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            print(f"   状态码: {response.status_code}")
            print(f"   响应时间: {elapsed_time:.2f}秒")
            print(f"   回答: {data.get('answer', '')[:100]}...")
            print(f"   来源数: {len(data.get('sources', []))}")
        else:
            print(f"   错误: {response.status_code}")
            print(f"   响应: {response.text}")
    except requests.exceptions.Timeout:
        print(f"   超时: 请求超过60秒")
    except Exception as e:
        print(f"   错误: {e}")
    
    # 测试2: 知识库问题
    print("\n2. 测试知识库问题...")
    start_time = time.time()
    
    try:
        response = requests.post(
            "http://localhost:8000/api/chat/",
            json={"question": "什么是社会实践？"},
            timeout=60
        )
        
        elapsed_time = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            print(f"   状态码: {response.status_code}")
            print(f"   响应时间: {elapsed_time:.2f}秒")
            print(f"   回答: {data.get('answer', '')[:100]}...")
            print(f"   来源数: {len(data.get('sources', []))}")
        else:
            print(f"   错误: {response.status_code}")
            print(f"   响应: {response.text}")
    except requests.exceptions.Timeout:
        print(f"   超时: 请求超过60秒")
    except Exception as e:
        print(f"   错误: {e}")
    
    # 测试3: 检查Ollama服务
    print("\n3. 检查Ollama服务...")
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            data = response.json()
            models = data.get("models", [])
            print(f"   Ollama服务: 正常")
            print(f"   可用模型数: {len(models)}")
            for model in models:
                print(f"     - {model.get('name')}")
        else:
            print(f"   Ollama服务: 异常 ({response.status_code})")
    except Exception as e:
        print(f"   Ollama服务: 不可用 ({e})")
    
    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)
    print("\n建议:")
    print("1. 如果响应时间超过10秒，说明AI模型处理较慢")
    print("2. 已将前端超时时间从10秒增加到60秒")
    print("3. 刷新浏览器页面后重试")


if __name__ == "__main__":
    test_chat_api()
