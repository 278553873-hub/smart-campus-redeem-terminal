#!/usr/bin/env python3
"""
学生匹配工具类 - 支持班级筛选的修复版本
"""

from app.utils.student_matcher_simple import SimpleStudentMatcher
from typing import List, Dict, Any, Optional


class Student:
    """学生实体类"""

    def __init__(self, data: Dict[str, Any]):
        self.id: int = data.get("id", -1)
        self.name: str = data.get("name", "")
        self.gender: str = data.get("gender", "")
        self.class_id: int = data.get("class_id", -1)
        self.class_name: str = data.get("class_name", "")
        self.grade_id: int = data.get("grade_id", -1)
        self.grade_name: str = data.get("grade_name", "")

    def __repr__(self):
        return f"Student(id={self.id}, name='{self.name}', class='{self.class_name}')"


class MatchResult:
    """匹配结果实体类"""

    def __init__(self, score: float, student: Student, candidate_pinyin: str, target_pinyin: str):
        self.score: float = score
        self.student: Student = student
        self.candidate_pinyin: str = candidate_pinyin
        self.target_pinyin: str = target_pinyin

    def __repr__(self):
        return f"MatchResult(score={self.score:.3f}, student={self.student})"


class SimpleStudentMatcherFixed(SimpleStudentMatcher):
    """
    学生匹配工具类 - 支持仅班级筛选的修复版本
    """

    def match_students(
        self,
        query_name: str,
        student_list: List[Dict[str, Any]],
        class_name: Optional[str] = None,
        class_id: Optional[int] = None,
        grade_name: Optional[str] = None,
        grade_id: Optional[int] = None,
        gender: Optional[str] = None,
        limit: int = 10,
        min_score: float = 0.0
    ) -> List[MatchResult]:
        """
        匹配学生

        Args:
            query_name: 要匹配的学生姓名（可以为空，如果提供了筛选条件）
            student_list: 学生数据列表
            class_name: 可选的班级名称筛选
            class_id: 可选的班级ID筛选
            grade_name: 可选的年级名称筛选
            grade_id: 可选的年级ID筛选
            gender: 可选的性别筛选
            limit: 返回结果数量限制
            min_score: 最低相似度分数阈值

        Returns:
            匹配结果列表，按相似度降序排列
        """
        # 如果没有提供姓名但提供了班级/年级筛选条件，允许进行筛选
        has_filter_conditions = class_name or class_id is not None or grade_name or grade_id is not None
        if not query_name or not query_name.strip():
            if not has_filter_conditions:
                raise ValueError("学生姓名不能为空")
            # 如果只有筛选条件而没有姓名，设置空查询
            query_name = ""

        if not student_list:
            return []

        # 筛选学生列表 - 新逻辑：先筛选班级，再筛选学生
        filtered_students = student_list

        # 如果有班级名称条件，先进行班级级别的模糊匹配
        if class_name:
            # 获取所有可能的班级列表
            all_classes = {}
            for student in student_list:
                student_class_name = student.get("class_name", "")
                if student_class_name:
                    all_classes[student_class_name] = True

            # 对班级名称进行模糊匹配，最多匹配前3个班级
            matched_classes = []
            for candidate_class in all_classes.keys():
                if self.fuzzy_match_class_grade(class_name, candidate_class):
                    matched_classes.append(candidate_class)
                    if len(matched_classes) >= 3:  # 最多匹配前3个班级
                        break

            # 只保留匹配班级下的学生
            if matched_classes:
                filtered_students = [s for s in filtered_students
                                   if s.get("class_name", "") in matched_classes]
            else:
                # 如果没有匹配的班级，返回空结果
                filtered_students = []

        # 其他筛选条件保持不变
        if class_id is not None:
            filtered_students = [s for s in filtered_students if s.get("class_id") == class_id]
        if grade_name:
            filtered_students = [s for s in filtered_students
                               if self.fuzzy_match_class_grade(grade_name, s.get("grade_name", ""))]
        if grade_id is not None:
            filtered_students = [s for s in filtered_students if s.get("grade_id") == grade_id]
        if gender:
            filtered_students = [s for s in filtered_students if s.get("gender") == gender]

        # 如果查询名称为空，只返回筛选结果，不进行姓名匹配
        if not query_name:
            # 返回所有筛选后的学生，每个设置为满分
            results = []
            for student_data in filtered_students:
                student = Student(student_data)
                results.append(MatchResult(
                    score=1.0,
                    student=student,
                    candidate_pinyin='',
                    target_pinyin=''
                ))
            # 按学生ID排序
            results.sort(key=lambda x: x.student.id)
            return results[:limit]

        # 转换目标姓名为拼音
        target_pinyin = self.name_to_pinyin_list(query_name.strip())

        # 计算每个学生的相似度
        results = []
        for student_data in filtered_students:
            student_name = student_data.get("name", "")
            if not student_name:
                continue

            candidate_pinyin = self.name_to_pinyin_list(student_name)
            score = self.compute_similarity_score(target_pinyin, candidate_pinyin)

            if score >= min_score:
                student = Student(student_data)
                results.append(MatchResult(
                    score=round(score, 4),
                    student=student,
                    candidate_pinyin=" ".join(candidate_pinyin),
                    target_pinyin=" ".join(target_pinyin)
                ))

        # 按相似度降序排列
        results.sort(key=lambda item: item.score, reverse=True)
        return results[:limit]
