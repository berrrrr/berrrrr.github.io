---
layout: post
title: "[GitHub Actions] GitHub context 활용하기"
subtitle: "워크플로 실행 정보와 이벤트 payload 확인하기"
categories: programming
tags: devops
comments: true
---

GitHub Actions의 `github` context에는 워크플로를 실행시킨 이벤트, 저장소, ref, 실행 번호 등의 정보가 들어 있다. 전체 값은 `toJSON(github)`로 변환해 로그에서 확인할 수 있지만, `github.token`같은 민감한 값도 포함되므로 주의해야 한다.

## 자주 확인하는 항목

### 실행과 저장소

- `github.repository`: `owner/repository` 형식의 저장소 이름. 이미지 태그, 캐시 키, 배포 경로를 만들 때 자주 사용한다.
- `github.repository_owner`: 저장소를 소유한 계정 또는 조직 이름. 조직 단위의 레지스트리 경로를 조합할 때 유용하다.
- `github.repository_visibility`: 저장소의 공개 범위. 공개 여부에 따라 작업을 분기할 때 사용할 수 있다.
- `github.job`: 현재 실행 중인 job의 ID. workflow YAML의 `jobs.<job_id>`에서 지정한 값이며, step 실행 중에만 제공된다.
- `github.workflow`: workflow의 `name`. `name`을 생략했다면 workflow 파일 경로가 들어간다.

### ref와 commit SHA

- `github.ref`: workflow를 실행시킨 전체 ref. `push`라면 `refs/heads/main`, tag라면 `refs/tags/v1.0.0` 형식이다. `pull_request` 이벤트에서는 보통 `refs/pull/<PR 번호>/merge`를 가리킨다.
- `github.ref_name`: `github.ref`의 짧은 이름. 다만 PR merge ref에서는 예시와 같이 `20/merge`가 되므로, PR 소스 브랜치명으로 사용하면 안 된다.
- `github.ref_type`: ref 종류. `branch` 또는 `tag` 중 하나이므로 tag 배포 여부를 판단하기 좋다.
- `github.ref_protected`: 해당 ref에 branch protection 또는 ruleset이 적용됐는지 나타낸다.
- `github.sha`: workflow를 실행시킨 commit SHA. 이벤트 종류에 따라 의미가 달라지며, `pull_request` 이벤트에서는 PR 소스의 마지막 commit이 아니라 GitHub이 만든 merge commit의 SHA이다.
- `github.head_ref` / `github.base_ref`: PR의 소스 브랜치와 대상 브랜치. `pull_request` 또는 `pull_request_target` 이벤트에서만 제공된다.
- `github.event.pull_request.head.sha`: PR 소스 브랜치의 실제 commit SHA가 필요할 때 사용한다. PR 코드를 기준으로 이미지 태그를 만들 때 `github.sha`와 구분해야 한다.

### workflow 실행 식별자

- `github.run_id`: 저장소 내 workflow run의 고유 ID. 같은 run을 재실행해도 바뀌지 않아 로그나 artifact를 추적하기 좋다.
- `github.run_number`: 해당 workflow가 실행된 순번. workflow별로 1부터 증가하며 재실행해도 같은 값을 유지한다.
- `github.run_attempt`: 현재 run의 시도 횟수. 재실행할 때마다 1씩 증가하므로 `run_id`와 조합하면 각 시도를 구분할 수 있다.
- `github.retention_days`: workflow 로그와 artifact를 보관하는 기간.

### 실행 주체와 이벤트

- `github.actor`: 최초 workflow run을 실행시킨 사용자 또는 앱. workflow를 재실행해도 권한은 이 actor를 기준으로 한다.
- `github.triggering_actor`: 현재 실행을 직접 시작한 사용자. 다른 사용자가 re-run했다면 `github.actor`와 다를 수 있다.
- `github.event_name`: `push`, `pull_request`, `workflow_dispatch` 등 workflow를 실행시킨 이벤트 이름. 이벤트별로 job이나 step을 분기할 때 가장 먼저 확인하는 값이다.
- `github.event.action`: 이벤트의 세부 동작. PR이라면 `opened`, `synchronize`, `closed` 등의 값을 가질 수 있다. 예시의 `synchronize`는 PR 브랜치에 새 commit이 push된 경우다.
- `github.event`: workflow를 실행시킨 webhook payload 전체. 구조는 이벤트별로 다르므로 필요한 필드의 존재 여부를 고려해야 한다.
- `github.event.pull_request.number`: PR 번호. PR 전용 artifact 이름이나 프리뷰 환경 경로를 만들 때 유용하다.
- `github.event.pull_request.draft`: draft PR 여부. 배포나 비용이 큰 테스트를 정식 PR에서만 실행하고 싶을 때 활용할 수 있다.

### workflow 파일과 runner 경로

- `github.workflow_ref`: workflow 파일의 저장소, 경로, ref를 합친 값. reusable workflow의 출처를 확인할 때 유용하다.
- `github.workflow_sha`: workflow 파일이 있는 commit의 SHA. 실행 대상 코드의 SHA인 `github.sha`와 다를 수 있다.
- `github.workspace`: runner에서 step이 사용하는 기본 작업 디렉터리. `actions/checkout`으로 받은 저장소가 보통 여기에 위치한다.
- `github.event_path`: 전체 event payload가 JSON으로 저장된 runner 내 파일 경로. context 표현식보다 복잡한 payload 처리가 필요할 때 파일을 직접 읽을 수 있다.
- `github.output`: 현재 step의 output을 설정하는 명령 파일 경로. 이 값 자체가 output은 아니며, `name=value` 형식의 데이터를 해당 파일에 추가해야 한다.
- `github.step_summary`: job summary에 표시할 GitHub Flavored Markdown을 작성하는 파일 경로.

### 보안상 주의할 항목

- `github.token`: `GITHUB_TOKEN`과 기능적으로 같은 인증 토큰. step 실행 중에만 제공되며 전체 context를 출력할 때는 로그 외부 전송이나 artifact 저장을 피해야 한다.
- `github.event` 내의 PR 제목, 본문, 브랜치명 등은 외부 사용자가 조작할 수 있는 입력이다. 이 값을 shell 명령에 직접 삽입하면 script injection으로 이어질 수 있으므로, 환경 변수로 전달하고 올바르게 quoting하는 편이 안전하다.

> context의 필드와 event payload는 workflow를 실행시킨 이벤트에 따라 달라진다. 아래 JSON은 `pull_request` 이벤트의 한 예시이며, 모든 workflow에서 동일한 필드가 들어오는 것은 아니다.

- [GitHub Actions contexts reference](https://docs.github.com/en/actions/reference/workflows-and-actions/contexts)
- [GitHub Actions variables reference](https://docs.github.com/en/actions/reference/workflows-and-actions/variables)
- [Secure use: script injections](https://docs.github.com/en/actions/concepts/security/script-injections)

```json
{
    "token": "***",
    "job": "build",
    "ref": "refs/pull/20/merge",
    "sha": "83a71fa8b320c854504d3af8aac867eab3cf2135",
    "repository": "example-org/example_repository",
    "repository_owner": "example-org",
    "repository_owner_id": "46667075",
    "repositoryUrl": "git://github.com/example-org/example_repository.git",
    "run_id": "3844408538",
    "run_number": "35",
    "retention_days": "400",
    "run_attempt": "1",
    "artifact_cache_size_limit": "10",
    "repository_visibility": "private",
    "repository_id": "530037044",
    "actor_id": "111050474",
    "actor": "example-user",
    "triggering_actor": "example-user",
    "workflow": "Docker Image CI",
    "head_ref": "feature/issue-19",
    "base_ref": "develop",
    "event_name": "pull_request",
    "event":
    {
        "action": "synchronize",
        "after": "9e060862628235292a02e9a0b97c9fd38213b8e1",
        "before": "1319f516781003f1eb87f541ed6d4825536681e6",
        "enterprise":
        {
            "avatar_url": "https://avatars.githubusercontent.com/b/11728?v=4",
            "created_at": "2022-02-28T02:20:22Z",
            "description": "",
            "html_url": "https://example.com",
            "id": 11728,
            "name": "example-service",
            "node_id": "E_kgDNLdA",
            "slug": "example-service",
            "updated_at": "2022-05-25T07:03:17Z",
            "website_url": ""
        },
        "number": 20,
        "organization":
        {
            "avatar_url": "https://avatars.githubusercontent.com/u/46667075?v=4",
            "description": "",
            "events_url": "https://example.com",
            "hooks_url": "https://example.com",
            "id": 46667075,
            "issues_url": "https://example.com",
            "login": "example-org",
            "members_url": "https://example.com",
            "node_id": "MDEyOk9yZ2FuaXphdGlvbjQ2NjY3MDc1",
            "public_members_url": "https://example.com",
            "repos_url": "https://example.com",
            "url": "https://example.com"
        },
        "pull_request":
        {
            "_links":
            {
                "comments":
                {
                    "href": "https://example.com"
                },
                "commits":
                {
                    "href": "https://example.com"
                },
                "html":
                {
                    "href": "https://example.com"
                },
                "issue":
                {
                    "href": "https://example.com"
                },
                "review_comment":
                {
                    "href": "https://example.com"
                },
                "review_comments":
                {
                    "href": "https://example.com"
                },
                "self":
                {
                    "href": "https://example.com"
                },
                "statuses":
                {
                    "href": "https://example.com"
                }
            },
            "active_lock_reason": null,
            "additions": 35,
            "assignee": null,
            "assignees":
            [],
            "author_association": "COLLABORATOR",
            "auto_merge": null,
            "base":
            {
                "label": "example-org:develop",
                "ref": "develop",
                "repo":
                {
                    "allow_auto_merge": false,
                    "allow_forking": true,
                    "allow_merge_commit": true,
                    "allow_rebase_merge": true,
                    "allow_squash_merge": true,
                    "allow_update_branch": false,
                    "archive_url": "https://example.com",
                    "archived": false,
                    "assignees_url": "https://example.com",
                    "blobs_url": "https://example.com",
                    "branches_url": "https://example.com",
                    "clone_url": "https://example.com",
                    "collaborators_url": "https://example.com",
                    "comments_url": "https://example.com",
                    "commits_url": "https://example.com",
                    "compare_url": "https://example.com",
                    "contents_url": "https://example.com",
                    "contributors_url": "https://example.com",
                    "created_at": "2022-08-29T02:18:33Z",
                    "default_branch": "main",
                    "delete_branch_on_merge": false,
                    "deployments_url": "https://example.com",
                    "description": null,
                    "disabled": false,
                    "downloads_url": "https://example.com",
                    "events_url": "https://example.com",
                    "fork": false,
                    "forks": 0,
                    "forks_count": 0,
                    "forks_url": "https://example.com",
                    "full_name": "example-org/example_repository",
                    "git_commits_url": "https://example.com",
                    "git_refs_url": "https://example.com",
                    "git_tags_url": "https://example.com",
                    "git_url": "git://github.com/example-org/example_repository.git",
                    "has_discussions": false,
                    "has_downloads": true,
                    "has_issues": true,
                    "has_pages": false,
                    "has_projects": true,
                    "has_wiki": true,
                    "homepage": null,
                    "hooks_url": "https://example.com",
                    "html_url": "https://example.com",
                    "id": 530037044,
                    "is_template": false,
                    "issue_comment_url": "https://example.com",
                    "issue_events_url": "https://example.com",
                    "issues_url": "https://example.com",
                    "keys_url": "https://example.com",
                    "labels_url": "https://example.com",
                    "language": "Vue",
                    "languages_url": "https://example.com",
                    "license":
                    {
                        "key": "mit",
                        "name": "MIT License",
                        "node_id": "MDc6TGljZW5zZTEz",
                        "spdx_id": "MIT",
                        "url": "https://api.github.com/licenses/mit"
                    },
                    "merge_commit_message": "PR_TITLE",
                    "merge_commit_title": "MERGE_MESSAGE",
                    "merges_url": "https://example.com",
                    "milestones_url": "https://example.com",
                    "mirror_url": null,
                    "name": "example_repository",
                    "node_id": "R_kgDOH5e5NA",
                    "notifications_url": "https://example.com",
                    "open_issues": 3,
                    "open_issues_count": 3,
                    "owner":
                    {
                        "avatar_url": "https://avatars.githubusercontent.com/u/46667075?v=4",
                        "events_url": "https://example.com",
                        "followers_url": "https://example.com",
                        "following_url": "https://example.com",
                        "gists_url": "https://example.com",
                        "gravatar_id": "",
                        "html_url": "https://example.com",
                        "id": 46667075,
                        "login": "example-org",
                        "node_id": "MDEyOk9yZ2FuaXphdGlvbjQ2NjY3MDc1",
                        "organizations_url": "https://example.com",
                        "received_events_url": "https://example.com",
                        "repos_url": "https://example.com",
                        "site_admin": false,
                        "starred_url": "https://example.com",
                        "subscriptions_url": "https://example.com",
                        "type": "Organization",
                        "url": "https://example.com"
                    },
                    "private": true,
                    "pulls_url": "https://example.com",
                    "pushed_at": "2023-01-05T06:26:03Z",
                    "releases_url": "https://example.com",
                    "size": 227,
                    "squash_merge_commit_message": "COMMIT_MESSAGES",
                    "squash_merge_commit_title": "COMMIT_OR_PR_TITLE",
                    "ssh_url": "git@github.com:example-org/example_repository.git",
                    "stargazers_count": 0,
                    "stargazers_url": "https://example.com",
                    "statuses_url": "https://example.com",
                    "subscribers_url": "https://example.com",
                    "subscription_url": "https://example.com",
                    "svn_url": "https://example.com",
                    "tags_url": "https://example.com",
                    "teams_url": "https://example.com",
                    "topics":
                    [],
                    "trees_url": "https://example.com",
                    "updated_at": "2022-08-29T04:51:05Z",
                    "url": "https://example.com",
                    "use_squash_pr_title_as_default": false,
                    "visibility": "private",
                    "watchers": 0,
                    "watchers_count": 0,
                    "web_commit_signoff_required": false
                },
                "sha": "4775d6cb2a33ac83b1454c4afe750e3f314d469d",
                "user":
                {
                    "avatar_url": "https://avatars.githubusercontent.com/u/46667075?v=4",
                    "events_url": "https://example.com",
                    "followers_url": "https://example.com",
                    "following_url": "https://example.com",
                    "gists_url": "https://example.com",
                    "gravatar_id": "",
                    "html_url": "https://example.com",
                    "id": 46667075,
                    "login": "example-org",
                    "node_id": "MDEyOk9yZ2FuaXphdGlvbjQ2NjY3MDc1",
                    "organizations_url": "https://example.com",
                    "received_events_url": "https://example.com",
                    "repos_url": "https://example.com",
                    "site_admin": false,
                    "starred_url": "https://example.com",
                    "subscriptions_url": "https://example.com",
                    "type": "Organization",
                    "url": "https://example.com"
                }
            },
            "body": "#19 ",
            "changed_files": 4,
            "closed_at": null,
            "comments": 0,
            "comments_url": "https://example.com",
            "commits": 5,
            "commits_url": "https://example.com",
            "created_at": "2023-01-05T06:13:19Z",
            "deletions": 24,
            "diff_url": "https://example.com",
            "draft": false,
            "head":
            {
                "label": "example-org:feature/issue-19",
                "ref": "feature/issue-19",
                "repo":
                {
                    "allow_auto_merge": false,
                    "allow_forking": true,
                    "allow_merge_commit": true,
                    "allow_rebase_merge": true,
                    "allow_squash_merge": true,
                    "allow_update_branch": false,
                    "archive_url": "https://example.com",
                    "archived": false,
                    "assignees_url": "https://example.com",
                    "blobs_url": "https://example.com",
                    "branches_url": "https://example.com",
                    "clone_url": "https://example.com",
                    "collaborators_url": "https://example.com",
                    "comments_url": "https://example.com",
                    "commits_url": "https://example.com",
                    "compare_url": "https://example.com",
                    "contents_url": "https://example.com",
                    "contributors_url": "https://example.com",
                    "created_at": "2022-08-29T02:18:33Z",
                    "default_branch": "main",
                    "delete_branch_on_merge": false,
                    "deployments_url": "https://example.com",
                    "description": null,
                    "disabled": false,
                    "downloads_url": "https://example.com",
                    "events_url": "https://example.com",
                    "fork": false,
                    "forks": 0,
                    "forks_count": 0,
                    "forks_url": "https://example.com",
                    "full_name": "example-org/example_repository",
                    "git_commits_url": "https://example.com",
                    "git_refs_url": "https://example.com",
                    "git_tags_url": "https://example.com",
                    "git_url": "git://github.com/example-org/example_repository.git",
                    "has_discussions": false,
                    "has_downloads": true,
                    "has_issues": true,
                    "has_pages": false,
                    "has_projects": true,
                    "has_wiki": true,
                    "homepage": null,
                    "hooks_url": "https://example.com",
                    "html_url": "https://example.com",
                    "id": 530037044,
                    "is_template": false,
                    "issue_comment_url": "https://example.com",
                    "issue_events_url": "https://example.com",
                    "issues_url": "https://example.com",
                    "keys_url": "https://example.com",
                    "labels_url": "https://example.com",
                    "language": "Vue",
                    "languages_url": "https://example.com",
                    "license":
                    {
                        "key": "mit",
                        "name": "MIT License",
                        "node_id": "MDc6TGljZW5zZTEz",
                        "spdx_id": "MIT",
                        "url": "https://api.github.com/licenses/mit"
                    },
                    "merge_commit_message": "PR_TITLE",
                    "merge_commit_title": "MERGE_MESSAGE",
                    "merges_url": "https://example.com",
                    "milestones_url": "https://example.com",
                    "mirror_url": null,
                    "name": "example_repository",
                    "node_id": "R_kgDOH5e5NA",
                    "notifications_url": "https://example.com",
                    "open_issues": 3,
                    "open_issues_count": 3,
                    "owner":
                    {
                        "avatar_url": "https://avatars.githubusercontent.com/u/46667075?v=4",
                        "events_url": "https://example.com",
                        "followers_url": "https://example.com",
                        "following_url": "https://example.com",
                        "gists_url": "https://example.com",
                        "gravatar_id": "",
                        "html_url": "https://example.com",
                        "id": 46667075,
                        "login": "example-org",
                        "node_id": "MDEyOk9yZ2FuaXphdGlvbjQ2NjY3MDc1",
                        "organizations_url": "https://example.com",
                        "received_events_url": "https://example.com",
                        "repos_url": "https://example.com",
                        "site_admin": false,
                        "starred_url": "https://example.com",
                        "subscriptions_url": "https://example.com",
                        "type": "Organization",
                        "url": "https://example.com"
                    },
                    "private": true,
                    "pulls_url": "https://example.com",
                    "pushed_at": "2023-01-05T06:26:03Z",
                    "releases_url": "https://example.com",
                    "size": 227,
                    "squash_merge_commit_message": "COMMIT_MESSAGES",
                    "squash_merge_commit_title": "COMMIT_OR_PR_TITLE",
                    "ssh_url": "git@github.com:example-org/example_repository.git",
                    "stargazers_count": 0,
                    "stargazers_url": "https://example.com",
                    "statuses_url": "https://example.com",
                    "subscribers_url": "https://example.com",
                    "subscription_url": "https://example.com",
                    "svn_url": "https://example.com",
                    "tags_url": "https://example.com",
                    "teams_url": "https://example.com",
                    "topics":
                    [],
                    "trees_url": "https://example.com",
                    "updated_at": "2022-08-29T04:51:05Z",
                    "url": "https://example.com",
                    "use_squash_pr_title_as_default": false,
                    "visibility": "private",
                    "watchers": 0,
                    "watchers_count": 0,
                    "web_commit_signoff_required": false
                },
                "sha": "9e060862628235292a02e9a0b97c9fd38213b8e1",
                "user":
                {
                    "avatar_url": "https://avatars.githubusercontent.com/u/46667075?v=4",
                    "events_url": "https://example.com",
                    "followers_url": "https://example.com",
                    "following_url": "https://example.com",
                    "gists_url": "https://example.com",
                    "gravatar_id": "",
                    "html_url": "https://example.com",
                    "id": 46667075,
                    "login": "example-org",
                    "node_id": "MDEyOk9yZ2FuaXphdGlvbjQ2NjY3MDc1",
                    "organizations_url": "https://example.com",
                    "received_events_url": "https://example.com",
                    "repos_url": "https://example.com",
                    "site_admin": false,
                    "starred_url": "https://example.com",
                    "subscriptions_url": "https://example.com",
                    "type": "Organization",
                    "url": "https://example.com"
                }
            },
            "html_url": "https://example.com",
            "id": 1185963217,
            "issue_url": "https://example.com",
            "labels":
            [],
            "locked": false,
            "maintainer_can_modify": false,
            "merge_commit_sha": "65fe8f3512631f606e6aef49caf9c3db998458d4",
            "mergeable": null,
            "mergeable_state": "unknown",
            "merged": false,
            "merged_at": null,
            "merged_by": null,
            "milestone": null,
            "node_id": "PR_kwDOH5e5NM5GsFzR",
            "number": 20,
            "patch_url": "https://example.com",
            "rebaseable": null,
            "requested_reviewers":
            [],
            "requested_teams":
            [],
            "review_comment_url": "https://example.com",
            "review_comments": 0,
            "review_comments_url": "https://example.com",
            "state": "open",
            "statuses_url": "https://example.com",
            "title": "Feature/issue 19",
            "updated_at": "2023-01-05T06:26:03Z",
            "url": "https://example.com",
            "user":
            {
                "avatar_url": "https://avatars.githubusercontent.com/u/111050474?v=4",
                "events_url": "https://example.com",
                "followers_url": "https://example.com",
                "following_url": "https://example.com",
                "gists_url": "https://example.com",
                "gravatar_id": "",
                "html_url": "https://example.com",
                "id": 111050474,
                "login": "example-user",
                "node_id": "U_kgDOBp5-6g",
                "organizations_url": "https://example.com",
                "received_events_url": "https://example.com",
                "repos_url": "https://example.com",
                "site_admin": false,
                "starred_url": "https://example.com",
                "subscriptions_url": "https://example.com",
                "type": "User",
                "url": "https://example.com"
            }
        },
        "repository":
        {
            "allow_forking": true,
            "archive_url": "https://example.com",
            "archived": false,
            "assignees_url": "https://example.com",
            "blobs_url": "https://example.com",
            "branches_url": "https://example.com",
            "clone_url": "https://example.com",
            "collaborators_url": "https://example.com",
            "comments_url": "https://example.com",
            "commits_url": "https://example.com",
            "compare_url": "https://example.com",
            "contents_url": "https://example.com",
            "contributors_url": "https://example.com",
            "created_at": "2022-08-29T02:18:33Z",
            "default_branch": "main",
            "deployments_url": "https://example.com",
            "description": null,
            "disabled": false,
            "downloads_url": "https://example.com",
            "events_url": "https://example.com",
            "fork": false,
            "forks": 0,
            "forks_count": 0,
            "forks_url": "https://example.com",
            "full_name": "example-org/example_repository",
            "git_commits_url": "https://example.com",
            "git_refs_url": "https://example.com",
            "git_tags_url": "https://example.com",
            "git_url": "git://github.com/example-org/example_repository.git",
            "has_discussions": false,
            "has_downloads": true,
            "has_issues": true,
            "has_pages": false,
            "has_projects": true,
            "has_wiki": true,
            "homepage": null,
            "hooks_url": "https://example.com",
            "html_url": "https://example.com",
            "id": 530037044,
            "is_template": false,
            "issue_comment_url": "https://example.com",
            "issue_events_url": "https://example.com",
            "issues_url": "https://example.com",
            "keys_url": "https://example.com",
            "labels_url": "https://example.com",
            "language": "Vue",
            "languages_url": "https://example.com",
            "license":
            {
                "key": "mit",
                "name": "MIT License",
                "node_id": "MDc6TGljZW5zZTEz",
                "spdx_id": "MIT",
                "url": "https://api.github.com/licenses/mit"
            },
            "merges_url": "https://example.com",
            "milestones_url": "https://example.com",
            "mirror_url": null,
            "name": "example_repository",
            "node_id": "R_kgDOH5e5NA",
            "notifications_url": "https://example.com",
            "open_issues": 3,
            "open_issues_count": 3,
            "owner":
            {
                "avatar_url": "https://avatars.githubusercontent.com/u/46667075?v=4",
                "events_url": "https://example.com",
                "followers_url": "https://example.com",
                "following_url": "https://example.com",
                "gists_url": "https://example.com",
                "gravatar_id": "",
                "html_url": "https://example.com",
                "id": 46667075,
                "login": "example-org",
                "node_id": "MDEyOk9yZ2FuaXphdGlvbjQ2NjY3MDc1",
                "organizations_url": "https://example.com",
                "received_events_url": "https://example.com",
                "repos_url": "https://example.com",
                "site_admin": false,
                "starred_url": "https://example.com",
                "subscriptions_url": "https://example.com",
                "type": "Organization",
                "url": "https://example.com"
            },
            "private": true,
            "pulls_url": "https://example.com",
            "pushed_at": "2023-01-05T06:26:03Z",
            "releases_url": "https://example.com",
            "size": 227,
            "ssh_url": "git@github.com:example-org/example_repository.git",
            "stargazers_count": 0,
            "stargazers_url": "https://example.com",
            "statuses_url": "https://example.com",
            "subscribers_url": "https://example.com",
            "subscription_url": "https://example.com",
            "svn_url": "https://example.com",
            "tags_url": "https://example.com",
            "teams_url": "https://example.com",
            "topics":
            [],
            "trees_url": "https://example.com",
            "updated_at": "2022-08-29T04:51:05Z",
            "url": "https://example.com",
            "visibility": "private",
            "watchers": 0,
            "watchers_count": 0,
            "web_commit_signoff_required": false
        },
        "sender":
        {
            "avatar_url": "https://avatars.githubusercontent.com/u/111050474?v=4",
            "events_url": "https://example.com",
            "followers_url": "https://example.com",
            "following_url": "https://example.com",
            "gists_url": "https://example.com",
            "gravatar_id": "",
            "html_url": "https://example.com",
            "id": 111050474,
            "login": "example-user",
            "node_id": "U_kgDOBp5-6g",
            "organizations_url": "https://example.com",
            "received_events_url": "https://example.com",
            "repos_url": "https://example.com",
            "site_admin": false,
            "starred_url": "https://example.com",
            "subscriptions_url": "https://example.com",
            "type": "User",
            "url": "https://example.com"
        }
    },
    "server_url": "https://github.com",
    "api_url": "https://api.github.com",
    "graphql_url": "https://api.github.com/graphql",
    "ref_name": "20/merge",
    "ref_protected": false,
    "ref_type": "branch",
    "secret_source": "Actions",
    "workflow_ref": "example-org/example_repository/.github/workflows/docker_build.yaml@refs/pull/20/merge",
    "workflow_sha": "83a71fa8b320c854504d3af8aac867eab3cf2135",
    "workspace": "/runner/_work/example_repository/example_repository",
    "event_path": "/runner/_work/_temp/_github_workflow/event.json",
    "path": "/runner/_work/_temp/_runner_file_commands/add_path_c21fb224-944e-4fd8-8b61-cab4a0b86bc8",
    "env": "/runner/_work/_temp/_runner_file_commands/set_env_c21fb224-944e-4fd8-8b61-cab4a0b86bc8",
    "step_summary": "/runner/_work/_temp/_runner_file_commands/step_summary_c21fb224-944e-4fd8-8b61-cab4a0b86bc8",
    "state": "/runner/_work/_temp/_runner_file_commands/save_state_c21fb224-944e-4fd8-8b61-cab4a0b86bc8",
    "output": "/runner/_work/_temp/_runner_file_commands/set_output_c21fb224-944e-4fd8-8b61-cab4a0b86bc8",
    "action": "__run",
    "action_repository": "",
    "action_ref": ""
}
```
